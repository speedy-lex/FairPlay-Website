// utils/videoHelpers.ts

export async function fetchYoutubeDuration(youtubeId: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${youtubeId}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items.length === 0) return '';
    // data.items[0].contentDetails.duration is using ISO 8601 format
    return data.items[0].contentDetails.duration;
  } catch {
    return '';
  }
}

export function parseISODuration(iso: string): string {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const [, h, m, s] = match.map(x => parseInt(x || '0', 10));
  const parts = [];
  if (h) parts.push(h);
  parts.push((m ?? 0).toString().padStart(h ? 2 : 1, '0'));
  parts.push((s ?? 0).toString().padStart(2, '0'));
  return parts.join(':');
}