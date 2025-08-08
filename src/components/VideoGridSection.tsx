import React, { useEffect, useState, useCallback, FC } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/props/icons';
import type { Video } from '@/types';
import { supabase } from '@/lib/supabase';

interface VideoGridSectionProps {
  loading: boolean;
  error: string | null;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredVideos: Video[];
  parseISODuration: (iso: string) => string;
  parseThemes: (themes: string | string[]) => string[];
}

const TEXT = {
  loading: 'Chargement…',
  errorPrefix: 'Erreur :',
  scoreLabel: '', // keep it there in case...
  byPrefix: '',
  authorPending: 'Auteur…',
  authorUnknown: 'Auteur inconnu',
  noVideosDuration: '—',
  categoryScrollAria: 'Faire défiler les catégories',
};

function formatSecondsToReadable(sec: number): string {
  if (!isFinite(sec) || isNaN(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function normalizeDuration(raw: unknown): string | number | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    if (/^P/.test(trimmed)) return trimmed; // ISO 8601
    const asNum = Number(trimmed);
    if (!Number.isNaN(asNum) && isFinite(asNum)) return asNum;
    return null;
  }
  if (typeof raw === 'number' && isFinite(raw)) {
    return raw;
  }
  return null;
}

function parseISODurationFallback(iso: string): string {
  if (typeof iso !== 'string' || !iso.startsWith('P')) return TEXT.noVideosDuration;
  const regex = /P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const match = iso.match(regex);
  if (!match) return TEXT.noVideosDuration;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoGridSection({
  loading,
  error,
  categories,
  selectedCategory,
  setSelectedCategory,
  filteredVideos,
  parseISODuration,
  parseThemes,
}: VideoGridSectionProps) {
  const [authorMap, setAuthorMap] = useState<Record<string, string>>({});
  const [loadingAuthors, setLoadingAuthors] = useState(false);

  useEffect(() => {
    const fetchMissingAuthors = async () => {
      const userIds = Array.from(
        new Set(
          filteredVideos
            .map((v) => (v as any).user_id)
            .filter(Boolean) as string[]
        )
      );
      if (userIds.length === 0) {
        console.warn(
          '[VideoGridSection] Aucun user_id trouvé dans filteredVideos.'
        );
        return;
      }

      const missing = userIds.filter((id) => !authorMap[id]);
      if (missing.length === 0) return;

      setLoadingAuthors(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', missing);

        if (fetchError) {
          console.error(
            '[VideoGridSection] Erreur récupération des profils :',
            fetchError
          );
        } else if (data) {
          setAuthorMap((prev) => {
            const copy = { ...prev };
            data.forEach((p) => {
              if (p.id) {
                copy[p.id] = p.username || '(username vide)';
              }
            });
            return copy;
          });
        } else {
          console.warn(
            '[VideoGridSection] Réponse Supabase sans data ni erreur :',
            missing
          );
        }
      } catch (e) {
        console.error(
          '[VideoGridSection] Exception pendant fetchMissingAuthors :',
          e
        );
      } finally {
        setLoadingAuthors(false);
      }
    };

    fetchMissingAuthors();
  }, [filteredVideos]);

  return (
    <section className="video-grid-section custom-scrollbar">
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-button ${
              category === selectedCategory ? 'active' : 'inactive'
            }`}
          >
            {category}
          </button>
        ))}
        <button
          className="category-scroll-button"
          aria-label={TEXT.categoryScrollAria}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {loading ? (
        <p className="video-meta">{TEXT.loading}</p>
      ) : error ? (
        <p className="video-meta video-error">
          {TEXT.errorPrefix} {error}
        </p>
      ) : (
        <div className="video-grid">
          {filteredVideos.map((video) => {
            const authorId = (video as any).user_id as string | undefined;
            const authorusername = authorId ? authorMap[authorId] : undefined;

            const originalRaw = video.duration;
            const normalized = normalizeDuration(originalRaw);
            let durationDisplay = TEXT.noVideosDuration;

            if (video.type === 'youtube') {
              if (typeof normalized === 'string') {
                const fromProp = parseISODuration(normalized);
                if (fromProp && fromProp !== normalized) {
                  durationDisplay = fromProp;
                } else {
                  durationDisplay = parseISODurationFallback(normalized);
                }
              } else if (typeof normalized === 'number') {
                durationDisplay = formatSecondsToReadable(normalized);
              }
            } else {
              // native or other
              if (typeof normalized === 'string' && normalized.startsWith('P')) {
                const fromProp = parseISODuration(normalized);
                if (fromProp && fromProp !== normalized) {
                  durationDisplay = fromProp;
                } else {
                  durationDisplay = parseISODurationFallback(normalized);
                  if (durationDisplay === TEXT.noVideosDuration) {
                    console.warn(
                      '[VideoGridSection] Impossible de parser la durée ISO native :',
                      { originalRaw, videoId: video.id, videoTitle: video.title }
                    );
                  }
                }
              } else if (typeof normalized === 'number') {
                durationDisplay = formatSecondsToReadable(normalized);
              }
            }

            if (
              durationDisplay === TEXT.noVideosDuration &&
              (normalized == null || normalized === '')
            ) {
              console.warn(
                '[VideoGridSection] Durée absente ou invalide pour la vidéo :',
                { originalRaw, videoId: video.id, videoTitle: video.title }
              );
            }

            return (
              <Link
                key={video.id}
                href={`/video/${video.id}`}
                legacyBehavior
                passHref
              >
                <a className="video-card">
                  <div className="video-thumbnail-container">
                    {(video as any).thumbnail ? (
                      <img
                        src={(video as any).thumbnail}
                        alt={video.title}
                        className="video-thumbnail"
                      />
                    ) : video.type === 'youtube' && video.youtube_id ? (
                      <img
                        src={`http://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        className="video-thumbnail"
                      />
                    ) : video.type === 'native' && video.url ? (
                      <video
                        src={video.url}
                        muted
                        className="video-thumbnail"
                      />
                    ) : null}
                    {video.type === 'youtube' && video.youtube_id && (
                      <span className="video-type-tag">YT</span>
                    )}
                    <span className="video-duration">
                      {durationDisplay}
                    </span>
                  </div>
                  <div className="video-content">
                    <h3 className="video-title">{video.title}</h3>
                    <div className="video-meta-info">
                      <span className="video-score">
                        {TEXT.scoreLabel}
                        {video.quality_score != null
                          ? ` ${video.quality_score.toFixed(1)} / 5`
                          : ' N/A'}
                      </span>
                      <span className="video-author">
                        {authorusername
                          ? `${TEXT.byPrefix} ${authorusername}`
                          : authorId
                          ? TEXT.authorPending
                          : TEXT.authorUnknown}
                      </span>
                    </div>
                    <p className="video-description">
                      {video.description}
                    </p>
                    <div className="video-tags">
                      {parseThemes(video.themes ?? []).map(
                        (theme, index) => (
                          <span key={index} className="tag">
                            {theme}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}
      <style jsx>{`
        .video-grid-section {
          flex: 1;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow-y: auto;
          background-color: #f0f0f0;
        }

        .category-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: center;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.03);
        }

        .category-button {
          background-color: var(--color-light-gray);
          border: 1px solid var(--color-light-gray);
          color: var(--color-medium-gray);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-button:hover {
          background-color: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(106, 142, 251, 0.2);
        }

        .category-button.active {
          background-color: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
          box-shadow: 0 2px 8px rgba(106, 142, 251, 0.2);
        }

        .category-scroll-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          color: var(--color-medium-gray);
          cursor: pointer;
          font-size: 1.5em;
          border-radius: 50%;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .category-scroll-button:hover {
          background-color: var(--color-light-gray);
          color: var(--color-dark-gray);
        }

        .video-meta {
          font-size: 1.1em;
          color: var(--color-medium-gray);
          text-align: center;
          margin-top: 2rem;
        }

        .video-meta.video-error {
          color: #ef4444;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          width: 100%;
          max-width: 100%;
        }

        .video-card {
          background-color: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }

        .video-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .video-thumbnail-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
        }

        .video-thumbnail {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-duration, .video-type-tag {
          position: absolute;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
          background-color: rgba(0, 0, 0, 0.75);
          padding: 1px 8px;
          border-radius: 4px;
        }

        .video-duration {
          bottom: 10px;
          right: 10px;
        }

        .video-type-tag {
          top: 10px;
          left: 10px;
          background-color: #ff0000;
        }

        .video-content {
          padding: 15px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .video-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 10px 0;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .video-meta-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 12px;
        }

        .video-score {
          font-weight: 600;
          color: #333;
        }

        .video-author {
          font-weight: 500;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .video-description {
          font-size: 0.95rem;
          color: #555;
          margin: 0;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .video-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: auto;
          padding-top: 10px;
        }

        .tag {
          background-color: #f0f2f5;
          color: #555;
          padding: 5px 11px;
          border-radius: 18px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        @media (max-width: 600px) {
          .video-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }

        @media (min-width: 601px) and (max-width: 992px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        @media (min-width: 993px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
      `}</style>
    </section>
  );
}
