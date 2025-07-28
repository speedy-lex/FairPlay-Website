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
      {/*<h1 className="category-heading">Explore videos</h1>*/}
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
        <button className="category-scroll-button"><ChevronRightIcon /></button>
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
                <a className="card">
                  <div className="mediaWrapper">
                    {video.type === 'youtube' && video.youtube_id && (
                      <span className="tagYT">YT</span>
                    )}
                    {video.type === 'youtube' && video.youtube_id ? (
                      <img
                        src={`http://img.youtube.com/vi/$${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        className="media"
                      />
                    ) : video.type === 'native' && video.url ? (
                      <video src={video.url} muted className="media" />
                    ) : null}
                    <span className="video-duration">
                      {video.type === 'youtube' ? parseISODuration(video.duration ?? '') : video.duration}
                    </span>
                  </div>
                  <div className="contentBlock">
                    <h2 className="videoTitle">{video.title}</h2>
                    <p className="score">{video.quality_score !== undefined && video.quality_score !== null ? video.quality_score.toFixed(1) : 'N/A'} / 5</p>
                    <p className="description">{video.description}</p>
                    <div className="video-tags">
                      {parseThemes(video.themes ?? []).map((theme, index) => (
                        <p key={index} className="theme">{theme}</p>
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
        .video-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        .card {
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease-in-out;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .mediaWrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          background-color: #f0f0f0;
          border-radius: 10px 10px 0 0; 
          overflow: hidden;
        }

        .media {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tagYT {
          position: absolute;
          top: 8px;
          left: 8px;
          background-color: #ff0000;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75em;
          font-weight: bold;
          z-index: 1;
        }

        .video-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .contentBlock {
          padding: 15px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          background: white;
        }

        .videoTitle {
          font-size: 1.1em;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 8px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .score {
          font-size: 0.9em;
          color: #606060;
          margin-bottom: 5px;
        }

        .description {
          font-size: 0.9em;
          color: #606060;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .video-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: auto;
        }

        .theme {
          background-color: #e0e0e0;
          color: #6a8efb;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75em;
          margin-bottom: 0px;
          margin-top: 5px;
        }

        :global(a) { text-decoration: none !important; }
        
        .icon-info {
          display: inline-flex;
          vertical-align: middle;
          margin-right: 0.5em;
        }

        .icon-info svg {
          width: 1em;
          height: 1em;
          color: var(--color-accent);
        }

        .section-title {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          gap: 0.75em;
          color: var(--color-dark-gray);
          font-family: 'Montserrat', sans-serif;
        }

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
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          background: white;
          padding: 20px;
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
          background: none;
          border: none;
          color: var(--color-medium-gray);
          cursor: pointer;
          font-size: 1.5em;
          padding: 5px;
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
          color: #ef4444; /* Keep error red */
        }

        .category-heading {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--color-dark-gray);
          margin-bottom: 2rem;
          position: relative;
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
        }

        .category-heading:after {
          content: '';
          position: absolute;
          width: 100%;
          height: 3px;
          bottom: -8px;
          left: 0;
          background: var(--color-accent);
        }

        .video-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 10px;
        }
          
        .mediaWrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          overflow: hidden;
          border-radius: 10px 10px 0 0;
        }

        .media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .videoTitle {
          font-size: 1.1em;
          margin-bottom: 8px;
        }

        .score {
          font-size: 0.9em;
          margin: 0px;
          color: var(--color-medium-gray);
        }

        .description {
          font-size: 0.9em;
          line-height: 1.5;
          margin: 0px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-medium-gray);
        }

        @media only screen and (max-width: 600px) {
          .video-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .category-filters {
            flex-direction: column;
            align-items: center;
            padding: 15px;
            margin-bottom: 1.5rem;
          }

          .category-button {
            width: 100%;
            margin-bottom: 5px;
          }

          .category-scroll-button {
            margin-top: 10px;
          }

          .section-title {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            text-align: center;
          }

          .videoTitle {
            font-size: 1em;
          }

          .score, .description {
            font-size: 0.85em;
          }

          .theme {
            font-size: 0.7em;
          }
        }

        @media only screen and (min-width: 601px) and (max-width: 768px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }

          .category-filters {
            justify-content: center;
            padding: 18px;
            margin-bottom: 1.75rem;
          }

          .section-title {
            font-size: 1.35rem;
            margin-bottom: 1.25rem;
          }
        }

        @media only screen and (min-width: 769px) and (max-width: 992px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media only screen and (min-width: 993px) and (max-width: 1200px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        @media only screen and (min-width: 1201px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
      `}</style>
    </section>
  );
}