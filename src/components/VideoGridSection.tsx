import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/icons';
import type { Video } from '@/types';

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
  return (
    <section className="video-grid-section custom-scrollbar">
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-button ${category === selectedCategory ? 'active' : 'inactive'}`}
          >
            {category}
          </button>
        ))}
        <button className="category-scroll-button">
          <ChevronRightIcon />
        </button>
      </div>
      {loading ? (
        <p className="video-meta">Loading…</p>
      ) : error ? (
        <p className="video-meta video-error">Error : {error}</p>
      ) : (
        <>
          <div className="video-grid">
            {filteredVideos.map(video => (
              <Link key={video.id} href={`/video/${video.id}`} legacyBehavior>
                <a className="video-card">
                  <div className="video-thumbnail-container">
                    {video.type === 'youtube' && video.youtube_id ? (
                      <img
                        src={`http://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        className="video-thumbnail"
                      />
                    ) : video.type === 'native' && video.url ? (
                      <video src={video.url} muted className="video-thumbnail" />
                    ) : null}
                    {video.type === 'youtube' && video.youtube_id && (
                      <span className="video-type-tag">YT</span>
                    )}
                    <span className="video-duration">
                      {video.type === 'youtube'
                        ? parseISODuration(video.duration ?? '')
                        : video.duration}
                    </span>
                  </div>
                  <div className="video-content">
                    <h3 className="video-title">{video.title}</h3>
                    <div className="video-meta-info">
                      <span className="video-score">
                        Score:
                        {video.quality_score !== undefined && video.quality_score !== null
                          ? ` ${video.quality_score.toFixed(1)} / 5`
                          : ' N/A'}
                      </span>
                    </div>
                    <p className="video-description">{video.description}</p>
                    <div className="video-tags">
                      {parseThemes(video.themes ?? []).map((theme, index) => (
                        <span key={index} className="tag">{theme}</span>
                      ))}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </>
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

        /* --- Style de la Card Vidéo équilibrée --- */
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

        /* --- Media Queries ajustées --- */
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