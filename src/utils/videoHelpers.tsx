export function normalizeThemes(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.filter((t): t is string => typeof t === 'string');
  }

  if (typeof input === 'string') {
    // Try to parse JSON
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.filter((t): t is string => typeof t === 'string');
      }
    } catch {
      // fallback
      return input
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
  }

  return [];
}

export async function getNativeVideoDuration(
  url: string,
  timeoutMs = 10000
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement('video');
    let timeoutId: number | null = null;

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      video.src = '';
    };

    const onLoaded = () => {
      const duration = video.duration;
      if (duration && !isNaN(duration) && isFinite(duration)) {
        resolve(duration);
      } else {
  reject(new Error('Invalid duration retrieved'));
      }
      cleanup();
    };

    const onError = () => {
  reject(new Error('Failed to load video metadata'));
      cleanup();
    };

    timeoutId = window.setTimeout(() => {
  reject(new Error('Timeout while retrieving video duration'));
      cleanup();
    }, timeoutMs);

    video.preload = 'metadata';
    video.src = url;
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);
  });
}

export async function fetchYoutubeDuration(
  youtubeId: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) {
  console.warn('No YouTube API key defined in NEXT_PUBLIC_YOUTUBE_API_KEY');
    return '';
  }

  const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
  endpoint.searchParams.set('part', 'contentDetails');
  endpoint.searchParams.set('id', youtubeId);
  endpoint.searchParams.set('key', apiKey);

  try {
    const response = await fetch(endpoint.toString());
    if (!response.ok) {
      console.warn('YouTube API responded with non-OK status', response.status);
      return '';
    }
    const data = await response.json();
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return '';
    }
    const duration: unknown = data.items[0]?.contentDetails?.duration;
    if (typeof duration === 'string') return duration;
    return '';
  } catch (err) {
  console.warn('Error while retrieving YouTube duration:', err);
    return '';
  }
}

export function secondsToISODuration(seconds: number): string {
  const sec = Math.floor(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  let iso = 'PT';
  if (hours) iso += `${hours}H`;
  if (minutes) iso += `${minutes}M`;
  if (secs || (!hours && !minutes)) iso += `${secs}S`;
  return iso;
}

export function parseISODuration(iso: string): string {
  if (!iso) return '';

  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const match = iso.match(regex);
  if (!match) return '';

  const [, hRaw, mRaw, sRaw] = match;
  const hours = parseInt(hRaw || '0', 10);
  const minutes = parseInt(mRaw || '0', 10);
  const seconds = parseInt(sRaw || '0', 10);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}
