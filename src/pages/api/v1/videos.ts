import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import type { Video } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Video[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, description, type, url, youtube_id, quality_score, themes, duration, thumbnail, created_at')
      .eq('is_verified', true)
      .eq('is_refused', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.status(200).json((data ?? []) as Video[])
  } catch (err) {
    console.error('API /api/v1/videos error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
