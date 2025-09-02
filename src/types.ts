export type ProfileData = {
  username: string;
  avatar_url: string | null;
};

export type Video = {
  id: string
  title: string
  description: string | null
  type: 'native' | 'youtube'
  url: string | null
  youtube_id: string | null
  user_id: string
  quality_score: number | null
  themes: string[] | string | null
  created_at: string
  duration?: string
  thumbnail: string | null
  is_verified?: boolean | null
  is_refused?: boolean | null
  storage_path?: string
  refusal_reason?: string | null
  verifiedOnce?: boolean | null
  refusedOnce?: boolean | null
  verifiedOnce_user_id?: string | null
  refusedOnce_user_id?: string | null
}