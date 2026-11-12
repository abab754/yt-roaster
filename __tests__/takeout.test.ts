import { describe, it, expect } from 'vitest';
import { parseTakeout } from '../lib/takeout';

describe('parseTakeout', () => {
  it('parses valid entries', () => {
    const raw = [
      {
        header: 'YouTube',
        title: 'Watched Cool Video',
        titleUrl: 'https://www.youtube.com/watch?v=abc12345678',
        subtitles: [{ name: 'Cool Channel' }],
        time: '2024-06-15T02:30:00.000Z',
      },
    ];
    const result = parseTakeout(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      videoId: 'abc12345678',
      title: 'Cool Video',
      channelName: 'Cool Channel',
      watchedAt: '2024-06-15T02:30:00.000Z',
    });
  });

  it('strips "Watched " prefix from title', () => {
    const raw = [
      {
        header: 'YouTube',
        title: 'Watched My Favorite Song',
        titleUrl: 'https://www.youtube.com/watch?v=xxxxxxxxxxx',
        subtitles: [{ name: 'Artist' }],
        time: '2024-01-01T00:00:00.000Z',
      },
    ];
    const result = parseTakeout(raw);
    expect(result[0].title).toBe('My Favorite Song');
  });

  it('skips entries without titleUrl (deleted/ads)', () => {
    const raw = [
      { header: 'YouTube', title: 'Watched an ad' },
      {
        header: 'YouTube',
        title: 'Watched Valid',
        titleUrl: 'https://www.youtube.com/watch?v=abc12345678',
        subtitles: [{ name: 'Ch' }],
        time: '',
      },
    ];
    const result = parseTakeout(raw);
    expect(result).toHaveLength(1);
  });

  it('skips YouTube Music entries', () => {
    const raw = [
      {
        header: 'YouTube Music',
        title: 'Watched Some Song',
        titleUrl: 'https://www.youtube.com/watch?v=abc12345678',
        subtitles: [{ name: 'Artist' }],
        time: '',
      },
    ];
    const result = parseTakeout(raw);
    expect(result).toHaveLength(0);
  });

  it('skips entries with invalid video URLs', () => {
    const raw = [
      {
        header: 'YouTube',
        title: 'Watched Something',
        titleUrl: 'https://www.youtube.com/channel/UC123',
        subtitles: [{ name: 'Ch' }],
        time: '',
      },
    ];
    const result = parseTakeout(raw);
    expect(result).toHaveLength(0);
  });

  it('throws on non-array input', () => {
    expect(() => parseTakeout({})).toThrow('Invalid Takeout format');
    expect(() => parseTakeout('string')).toThrow('Invalid Takeout format');
  });

  it('returns empty array for empty input', () => {
    const result = parseTakeout([]);
    expect(result).toEqual([]);
  });

  it('handles missing subtitles gracefully', () => {
    const raw = [
      {
        header: 'YouTube',
        title: 'Watched No Channel',
        titleUrl: 'https://www.youtube.com/watch?v=abc12345678',
        time: '',
      },
    ];
    const result = parseTakeout(raw);
    expect(result[0].channelName).toBe('Unknown');
  });
});
