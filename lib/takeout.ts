import type { TakeoutEntry } from './types';

interface RawTakeoutEntry {
  header?: string;
  title?: string;
  titleUrl?: string;
  subtitles?: { name?: string; url?: string }[];
  time?: string;
  products?: string[];
}

function extractVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function parseTakeout(raw: unknown): TakeoutEntry[] {
  if (!Array.isArray(raw)) {
    throw new Error(
      'Invalid Takeout format. Expected a JSON array. Make sure you exported as JSON, not HTML.',
    );
  }

  const entries: TakeoutEntry[] = [];

  for (const item of raw as RawTakeoutEntry[]) {
    // Skip non-YouTube entries (e.g. YouTube Music)
    if (item.header && item.header !== 'YouTube') continue;

    // Skip entries without a video URL (ads, deleted videos)
    if (!item.titleUrl) continue;

    const videoId = extractVideoId(item.titleUrl);
    if (!videoId) continue;

    // Strip "Watched " prefix that Takeout adds
    const title = (item.title ?? '').replace(/^Watched\s+/, '');

    entries.push({
      videoId,
      title: title || 'Unknown',
      channelName: item.subtitles?.[0]?.name ?? 'Unknown',
      watchedAt: item.time ?? '',
    });
  }

  return entries;
}
