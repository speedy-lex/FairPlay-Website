import { supabase } from './supabase'
import type { Video } from '@/types'
import { parseThemes } from './utils'

interface VideoRow {
  id: string
  title: string
  description: string
  type: 'native' | 'youtube'
  url: string | null
  youtube_id: string | null
  user_id: string
  quality_score: number | null
  themes: string[] | string | null
  thumbnail?: string | null
  created_at?: string | null
}

export async function getRecommendedVideos(userId: string): Promise<Video[]> {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('theme')
    .eq('user_id', userId)

  const likedThemes = prefs?.map(p => p.theme) ?? []

  const { data: videos } = await supabase
  .from('videos')
  .select('id, title, description, type, url, youtube_id, user_id, quality_score, themes, duration, thumbnail, is_verified, is_refused, created_at')
  .eq('is_verified', true)
  .eq('is_refused', false)
  .returns<VideoRow[]>()

  if (!videos) return []

  const scored = videos.map(v => {
    const themes = parseThemes(v.themes)
    const hasLiked = themes.some(t => likedThemes.includes(t))
    const themeScore = hasLiked ? 1 : 0
    const ratingScore = v.quality_score ?? 0
    const video: Video = {
      id: v.id,
      title: v.title,
      description: v.description ?? null,
      type: v.type,
      url: v.url,
      youtube_id: v.youtube_id,
      user_id: v.user_id,
      quality_score: v.quality_score ?? null,
      themes,
      thumbnail: v.thumbnail ?? null,
      created_at: (v.created_at ?? new Date().toISOString()) as string,
  duration: (v as unknown as { duration?: string })?.duration ?? undefined,
    }
    return { video, score: themeScore * 10 + ratingScore }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.map(s => s.video)
}
