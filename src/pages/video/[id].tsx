"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Video } from '@/types'
import { Topbar } from '@/components/ui/Topbar/Topbar'
import { Sidebar } from '@/components/ui/Sidebar/Sidebar'
import styles from './VideoDetailPage.module.css'

export default function VideoDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const [video, setVideo] = useState<Video | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('id, title, description, type, url, youtube_id, quality_score, themes')
          .eq('id', id as string)
          .single()
        if (videoError || !videoData) throw new Error(videoError?.message || 'Vidéo non trouvée')
        setVideo(videoData as Video)
        const { data: authData } = await supabase.auth.getUser()
        const user = authData.user
        if (user) {
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('score')
            .eq('video_id', id as string)
            .eq('user_id', user.id)
            .maybeSingle()
          if (ratingData) setUserRating(ratingData.score)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleRate = async (score: number) => {
    try {
      setUserRating(score)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) throw new Error('Utilisateur non authentifié')
      const userId = authData.user.id
      const { error: upsertError } = await supabase
        .from('ratings')
        .upsert({ video_id: id as string, user_id: userId, score }, { onConflict: 'video_id,user_id' })
      if (upsertError) throw upsertError
      const { data: refreshed } = await supabase
        .from('videos')
        .select('quality_score')
        .eq('id', id as string)
        .single()
      if (refreshed) setVideo(prev => prev ? { ...prev, quality_score: refreshed.quality_score } : prev)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="videos" />
        <main className="main-content">
          <div className={styles.videoDetailContainer}>
            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-center" style={{ color: 'red' }}>Error: {error}</p>}
            {!loading && video && (
              <>
                {/* Player */}
                {video.type === 'youtube' && video.youtube_id ? (
                  <iframe
                    className={styles.videoPlayer}
                    src={`https://www.youtube.com/embed/${video.youtube_id}`}
                    allowFullScreen
                  />
                ) : (
                  video.url && <video className={styles.videoPlayer} controls src={video.url} />
                )}

                {/* Title */}
                <h1 className={styles.title}>{video.title}</h1>

                {/* Rating + Download/Donate */}
                <div className={styles.metaRow}>
                  <div className={styles.ratingSection}>
                    <span className={styles.averageScore}>
                      Average: {video.quality_score != null ? video.quality_score.toFixed(1) : 'N/A'} / 5
                    </span>
                    <span>Your score:</span>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => handleRate(n)}
                        className={`${styles.ratingButton} ${n <= userRating ? styles.active : ''}`}
                      >
                        {n}⭐
                      </button>
                    ))}
                  </div>
                  <div className={styles.actions}>
                    {video.url && (
                      <a href={video.url} download className={styles.downloadButton}>
                        Download
                      </a>
                    )}
                    <button className={styles.donateButton}>Donate To the Creator</button>
                  </div>
                </div>

                {/* Description */}
                <div className={`${styles.descriptionContainer} ${descriptionExpanded ? styles.expanded : ''}`}>
                  <p className={styles.description}>{video.description}</p>
                </div>
                <button
                  className={styles.toggleDescription}
                  onClick={() => setDescriptionExpanded(prev => !prev)}
                >
                  {descriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}