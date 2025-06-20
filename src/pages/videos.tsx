// videos.tsx
import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { parseThemes } from '@/lib/utils'
import { VideoCard } from '@/components/VideoCard'
import type { Video } from '@/types'
import { getRecommendedVideos } from '@/lib/recommend'
import { UploadModal } from '@/components/UploadModal'
import { Layout } from '@/components/Layout'
import { ChevronRightIcon } from '@/components/icons'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tous')

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const vids = await getRecommendedVideos(user.id)
        setVideos(vids)
      } else {
        const { data } = await supabase
          .from('videos')
          .select('id, title, description, type, url, youtube_id, quality_score, themes')
          .order('created_at', { ascending: false })
        if (data) setVideos(data)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleUploadSuccess = () => {
    fetchVideos()
  }

  const categories = React.useMemo(() => {
    const all = videos.flatMap(v => parseThemes((v as any).themes))
    const unique = Array.from(new Set(all))
    return ['Tous', ...unique]
  }, [videos])

  const filteredVideos = selectedCategory === 'Tous'
    ? videos
    : videos.filter(v => parseThemes((v as any).themes).includes(selectedCategory))

  return (
    <Layout active="videos" onCreateClick={() => setShowUploadModal(true)}>
      <section className="video-grid-section custom-scrollbar">
        <h1 className="category-heading">Explorer les vidéos</h1>
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
          <div className="video-grid">
            {filteredVideos.map(video => (
              <Link key={video.id} href={`/video/${video.id}`} className="card">
                <div className="mediaWrapper">
                  {video.type === 'youtube' && video.youtube_id && (
                    <span className="tagYT">YT</span>
                  )}
                  {video.type === 'youtube' && video.youtube_id ? (
                    <img
                      src={`http://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                      alt={video.title}
                      className="media"
                    />
                  ) : video.type === 'native' && video.url ? (
                    <video src={video.url} muted className="media" />
                  ) : null}
                </div>
                <div className="contentBlock">
                  <h2 className="videoTitle">{video.title}</h2>
                  <p className="score">{video.quality_score !== undefined && video.quality_score !== null ? video.quality_score.toFixed(1) : 'N/A'} / 5</p>
                  <p className="description">{video.description}</p>
                  <p className="theme">{parseThemes(video.themes).join(', ')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} />
      )}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        html, body { margin: 0; font-family: 'Roboto', sans-serif; height: 100%; overflow: hidden; }
        #__next { height: 100%; } /* S'assurer que le conteneur Next.js prend toute la hauteur */
      `}</style>
      <style jsx>{`
        .video-grid-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          overflow-y: auto;
        }
        .category-filters {
          position: relative;
          z-index: 1;
          background-color: #0f0f0f;
          padding: 1rem 0;
          margin-bottom: 1rem;
          flex-shrink: 0;
          display: flex;
          overflow-x: auto;
          gap: 0.5rem;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .category-filters::-webkit-scrollbar { display: none; }
        .category-button {
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }
        .category-button.active {
          background-color: #fff;
          color: #1a1a1a;
        }
        .category-button.inactive {
          background-color: #333;
          color: #fff;
        }
        .category-button.inactive:hover { background-color: #4a4a4a; }
        .category-scroll-button {
          padding: 0.5rem;
          background-color: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
        }
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .card {
          position: relative;
          background: #282828;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow .2s ease;
          text-decoration: none;
          color: inherit;
        }
        .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .mediaWrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .media {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 13px;
        }
        .tagYT {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #f00;
          color: #fff;
          font-size: 12px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 1;
        }
        .contentBlock { padding: 12px; }
        .videoTitle {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #fff;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .score { font-size: 14px; color: #aaa; margin: 0 0 8px; }
        .description {
          font-size: 14px;
          color: #ccc;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .theme { font-size: 14px; color: #aaa; margin: 0; }
      `}</style>
    </Layout>
  )
}
