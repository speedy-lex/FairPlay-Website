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
      {/*<h1 className="category-heading">Explorer les vidéos</h1>*/}
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
        <p className="video-meta">Chargement des vidéos…</p>
      ) : error ? (
        <p className="video-meta video-error">Erreur : {error}</p>
      ) : (
        <>
          <h2 className="section-title">
            <span className="icon-info">
              <svg viewBox="0 0 25 25" fill="currentColor" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </span>
            Contenus Recommandés
          </h2>
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
        :global(body) { margin: 0; background-color: #f0f0f0; color: #333333;}
        .video-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* 3 columns by default for larger screens */
          gap: 20px; /* Space between cards */
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
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background-color: #f0f0f0; /* Placeholder background */
          border-radius: 10px 10px 0 0; /* Match card radius for the top corners */
          overflow: hidden; /* Ensure content respects border-radius */
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
          background-color: #ff0000; /* YouTube red */
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
          background-color: rgba(0, 0, 0, 0.7); /* Darker, semi-transparent background */
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
          -webkit-line-clamp: 2; /* Limit to 2 lines */
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
          -webkit-line-clamp: 2; /* Limit description to 2 lines */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .video-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: auto; /* Push tags to the bottom */
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
        /* Global reset for links within this scope, ensure they don't have underlines */
        :global(a) { text-decoration: none !important; }
        
        /* Icon information (e.g., watch count, duration icon) */
        .icon-info {
          display: inline-flex;
          vertical-align: middle;
          margin-right: 0.5em; /* Spacing between icon and text */
        }

        /* Styling for SVG icons within .icon-info */
        .icon-info svg {
          width: 1em;
          height: 1em;
          color: var(--color-accent); /* Use accent color for icons */
        }

        /* Section title styling */
        .section-title {
          display: flex;
          align-items: center;
          font-size: 1.5rem; /* Slightly larger for professionalism */
          font-weight: 700; /* Bolder */
          margin-bottom: 1.5rem; /* More space below the title */
          gap: 0.75em; /* Space between icon and text if present */
          color: var(--color-dark-gray); /* Consistent dark text */
          font-family: 'Montserrat', sans-serif; /* Consistent heading font */
        }

        /* Main container for video grid section */
        .video-grid-section {
          flex: 1; /* Allow section to grow */
          display: flex;
          flex-direction: column;
          padding: 0; /* Increased padding for more breathing room */
          overflow-y: auto; /* Enable scrolling if content overflows */
          background-color: #f0f0f0; /* Explicit white background for the section */
        }

        /* Container for category filter buttons */
        .category-filters {
          display: flex;
          gap: 10px; /* More space between buttons */
          margin-bottom: 2rem; /* More space below filters */
          flex-wrap: wrap; /* Allow buttons to wrap to next line */
          justify-content: center; /* Center buttons for a cleaner look */
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.03);
        }

        /* Styling for individual category buttons */
        .category-button {
          background-color: var(--color-light-gray); /* Light gray for inactive state */
          border: 1px solid var(--color-light-gray); /* Subtle border */
          color: var(--color-medium-gray); /* Softer text color */
          padding: 8px 16px; /* Adjusted padding */
          border-radius: 8px; /* Consistent button radius from style.css */
          font-size: 0.9em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease; /* Smooth transitions for hover effects */
        }

        /* Hover effect for category buttons */
        .category-button:hover {
          background-color: var(--color-accent); /* Accent background on hover */
          color: var(--color-white); /* White text on hover */
          border-color: var(--color-accent); /* Accent border on hover */
          transform: translateY(-2px); /* Subtle lift effect */
          box-shadow: 0 4px 12px rgba(106, 142, 251, 0.2); /* Accent shadow on hover */
        }

        /* Active state for category buttons */
        .category-button.active {
          background-color: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
          box-shadow: 0 2px 8px rgba(106, 142, 251, 0.2); /* Subtle shadow for active state */
        }

        /* Scroll buttons for categories (if implemented) */
        .category-scroll-button {
          background: none;
          border: none;
          color: var(--color-medium-gray);
          cursor: pointer;
          font-size: 1.5em; /* Larger icon */
          padding: 5px;
          border-radius: 50%;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Hover effect for scroll buttons */
        .category-scroll-button:hover {
          background-color: var(--color-light-gray);
          color: var(--color-dark-gray);
        }

        /* Meta information text (e.g., video count message) */
        .video-meta {
          font-size: 1.1em;
          color: var(--color-medium-gray);
          text-align: center;
          margin-top: 2rem;
        }

        /* Specific style for error messages in video meta */
        .video-meta.video-error {
          color: #ef4444; /* Keep error red */
        }

        /* Styling for main category headings (e.g., "Trending Videos") */
        .category-heading {
          font-size: 2.2rem; /* Larger and bolder */
          font-weight: 700;
          color: var(--color-dark-gray);
          margin-bottom: 2rem; /* More space below the heading */
          position: relative;
          display: inline-block; /* Allows the :after pseudo-element to be relative to text width */
          font-family: 'Montserrat', sans-serif; /* Consistent heading font */
        }

        /* Underline effect for category heading */
        .category-heading:after {
          content: '';
          position: absolute;
          width: 100%;
          height: 3px; /* Slightly thicker underline */
          bottom: -8px; /* More space below heading */
          left: 0;
          background: var(--color-accent); /* Use accent color for the underline */
        }

        /* Container for video tags */
        .video-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px; /* Space between tags */
          margin-top: 10px; /* Space above tags */
        }
          
        /* Wrapper for media (image/video thumbnail) within the card */
        .mediaWrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          overflow: hidden;
          border-radius: 10px 10px 0 0; /* Match card radius for the top corners */
        }

        /* Styling for the actual media element (img/video) */
        .media {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Cover the area without distortion */
          display: block;
        }

        /* Styling for video duration overlay */
        .video-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background-color: rgba(0, 0, 0, 0.7); /* Darker, semi-transparent background */
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        /* Styling for video title within the card */
        .videoTitle {
          font-size: 1.1em; /* Adjust title size */
          margin-bottom: 8px; /* More space below the title */
        }

        /* Styling for video score */
        .score {
          font-size: 0.9em;
          margin: 0px;
          color: var(--color-medium-gray); /* Ensure consistent text color */
        }

        /* Styling for video description */
        .description {
          font-size: 0.9em;
          line-height: 1.5;
          margin: 0px;
          display: -webkit-box; /* Enable multiline truncation */
          -webkit-line-clamp: 2; /* Limit description to 2 lines */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis; /* Add ellipsis for truncated text */
          color: var(--color-medium-gray); /* Ensure consistent text color */
        }

        /* Responsive adjustments */

        /* Extra small devices (phones, 600px and down) */
        @media only screen and (max-width: 600px) {
          .video-grid {
            grid-template-columns: 1fr; /* Single column */
            gap: 15px;
          }

          .category-filters {
            flex-direction: column; /* Stack buttons vertically */
            align-items: center; /* Center them */
            padding: 15px;
            margin-bottom: 1.5rem;
          }

          .category-button {
            width: 100%; /* Full width buttons */
            margin-bottom: 5px; /* Space between stacked buttons */
          }

          .category-scroll-button {
            margin-top: 10px; /* Space above scroll button if stacked */
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

        /* Small devices (portrait tablets and large phones, 600px to 768px) */
        @media only screen and (min-width: 601px) and (max-width: 768px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr); /* Two columns */
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

        /* Medium devices (landscape tablets, 768px to 992px) */
        @media only screen and (min-width: 769px) and (max-width: 992px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr); /* Two columns */
            gap: 20px;
          }
        }

        /* Large devices (laptops/desktops, 992px to 1200px) - Uses default 3 columns */
        @media only screen and (min-width: 993px) and (max-width: 1200px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        /* Extra large devices (large laptops and desktops, 1200px and up) - Uses default 3 columns */
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