// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  parseDuration,
  normalizeVideos,
  normalizeSubscriptions,
  normalizePlaylists,
  computeStats,
} from '../lib/profile';
import type { VideoSummary, Subscription, PlaylistSummary } from '../lib/types';

describe('parseDuration', () => {
  it('parses hours, minutes, and seconds', () => {
    expect(parseDuration('PT1H2M3S')).toBe(3723);
  });

  it('parses minutes and seconds only', () => {
    expect(parseDuration('PT10M30S')).toBe(630);
  });

  it('parses seconds only', () => {
    expect(parseDuration('PT45S')).toBe(45);
  });

  it('parses minutes only', () => {
    expect(parseDuration('PT5M')).toBe(300);
  });

  it('parses hours only', () => {
    expect(parseDuration('PT2H')).toBe(7200);
  });

  it('returns 0 for invalid input', () => {
    expect(parseDuration('')).toBe(0);
    expect(parseDuration('garbage')).toBe(0);
  });
});

describe('normalizeVideos', () => {
  it('maps playlist items and video details into VideoSummary[]', () => {
    const playlistItems = [
      {
        contentDetails: { videoId: 'abc123' },
        snippet: {
          title: 'Cool Video',
          videoOwnerChannelTitle: 'Cool Channel',
          publishedAt: '2024-01-01T00:00:00Z',
        },
      },
    ] as any[];

    const videoDetails = new Map([
      [
        'abc123',
        {
          id: 'abc123',
          contentDetails: { duration: 'PT5M30S' },
          snippet: { categoryId: '27' },
        },
      ],
    ] as any);

    const result = normalizeVideos(playlistItems, videoDetails);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      videoId: 'abc123',
      title: 'Cool Video',
      channelName: 'Cool Channel',
      categoryId: '27',
      categoryName: 'Education',
      durationSeconds: 330,
      publishedAt: '2024-01-01T00:00:00Z',
      isShort: false,
    });
  });

  it('marks videos under 60s as shorts', () => {
    const items = [
      {
        contentDetails: { videoId: 'short1' },
        snippet: {
          title: 'Short',
          videoOwnerChannelTitle: 'Ch',
          publishedAt: '',
        },
      },
    ] as any[];

    const details = new Map([
      [
        'short1',
        {
          id: 'short1',
          contentDetails: { duration: 'PT30S' },
          snippet: { categoryId: '24' },
        },
      ],
    ] as any);

    const result = normalizeVideos(items, details);
    expect(result[0].isShort).toBe(true);
  });

  it('filters out items with no videoId', () => {
    const items = [
      { contentDetails: {}, snippet: { title: 'No ID' } },
    ] as any[];

    const result = normalizeVideos(items, new Map());
    expect(result).toHaveLength(0);
  });

  it('falls back to defaults for missing fields', () => {
    const items = [{ contentDetails: { videoId: 'v1' }, snippet: {} }] as any[];

    const result = normalizeVideos(items, new Map());
    expect(result[0].title).toBe('Unknown');
    expect(result[0].channelName).toBe('Unknown');
    expect(result[0].categoryName).toBe('Other');
    expect(result[0].durationSeconds).toBe(0);
  });
});

describe('normalizeSubscriptions', () => {
  it('maps subscription data', () => {
    const subs = [
      {
        snippet: {
          resourceId: { channelId: 'ch1' },
          title: 'Channel One',
          description: 'Desc',
        },
      },
    ] as any[];

    const result = normalizeSubscriptions(subs);
    expect(result).toEqual([
      { channelId: 'ch1', channelTitle: 'Channel One', description: 'Desc' },
    ]);
  });
});

describe('normalizePlaylists', () => {
  it('maps playlist data', () => {
    const playlists = [
      {
        id: 'pl1',
        snippet: { title: 'My Playlist' },
        contentDetails: { itemCount: 5 },
      },
    ] as any[];

    const result = normalizePlaylists(playlists);
    expect(result).toEqual([{ id: 'pl1', title: 'My Playlist', itemCount: 5 }]);
  });
});

describe('computeStats', () => {
  const videos: VideoSummary[] = [
    {
      videoId: '1',
      title: 'V1',
      channelName: 'Alpha',
      categoryId: '27',
      categoryName: 'Education',
      durationSeconds: 600,
      publishedAt: '',
      isShort: false,
    },
    {
      videoId: '2',
      title: 'V2',
      channelName: 'Alpha',
      categoryId: '27',
      categoryName: 'Education',
      durationSeconds: 300,
      publishedAt: '',
      isShort: false,
    },
    {
      videoId: '3',
      title: 'V3',
      channelName: 'Beta',
      categoryId: '20',
      categoryName: 'Gaming',
      durationSeconds: 45,
      publishedAt: '',
      isShort: true,
    },
    {
      videoId: '4',
      title: 'V4',
      channelName: 'Alpha',
      categoryId: '10',
      categoryName: 'Music',
      durationSeconds: 200,
      publishedAt: '',
      isShort: false,
    },
    {
      videoId: '5',
      title: 'V5',
      channelName: 'Gamma',
      categoryId: '20',
      categoryName: 'Gaming',
      durationSeconds: 30,
      publishedAt: '',
      isShort: true,
    },
  ];

  const subs: Subscription[] = [
    { channelId: 'c1', channelTitle: 'Alpha', description: '' },
    { channelId: 'c2', channelTitle: 'Beta', description: '' },
  ];

  const playlists: PlaylistSummary[] = [
    { id: 'p1', title: 'Favs', itemCount: 10 },
  ];

  it('counts totals correctly', () => {
    const stats = computeStats(videos, subs, playlists);
    expect(stats.totalLiked).toBe(5);
    expect(stats.totalSubscriptions).toBe(2);
    expect(stats.totalPlaylists).toBe(1);
  });

  it('ranks top channels by like count descending', () => {
    const stats = computeStats(videos, subs, playlists);
    expect(stats.topChannels[0]).toEqual({ name: 'Alpha', count: 3 });
    expect(stats.topChannels[1]).toEqual({ name: 'Beta', count: 1 });
    expect(stats.topChannels[2]).toEqual({ name: 'Gamma', count: 1 });
  });

  it('computes category breakdown sorted descending', () => {
    const stats = computeStats(videos, subs, playlists);
    expect(stats.categoryBreakdown[0]).toEqual({
      category: 'Education',
      count: 2,
    });
    expect(stats.categoryBreakdown[1]).toEqual({
      category: 'Gaming',
      count: 2,
    });
    expect(stats.categoryBreakdown[2]).toEqual({ category: 'Music', count: 1 });
  });

  it('calculates average video duration', () => {
    const stats = computeStats(videos, subs, playlists);
    // (600 + 300 + 45 + 200 + 30) / 5 = 235
    expect(stats.avgVideoDurationSeconds).toBe(235);
  });

  it('splits shorts vs long-form', () => {
    const stats = computeStats(videos, subs, playlists);
    expect(stats.shortsVsLongForm).toEqual({ shorts: 2, long: 3 });
  });

  it('handles empty input', () => {
    const stats = computeStats([], [], []);
    expect(stats.totalLiked).toBe(0);
    expect(stats.topChannels).toEqual([]);
    expect(stats.categoryBreakdown).toEqual([]);
    expect(stats.avgVideoDurationSeconds).toBe(0);
    expect(stats.shortsVsLongForm).toEqual({ shorts: 0, long: 0 });
  });
});
