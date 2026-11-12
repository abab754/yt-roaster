import { describe, it, expect } from 'vitest';
import { computeHistoryStats } from '../lib/history-stats';
import type { TakeoutEntry } from '../lib/types';

function makeEntry(overrides: Partial<TakeoutEntry> = {}): TakeoutEntry {
  return {
    videoId: 'v1',
    title: 'Video',
    channelName: 'Channel',
    watchedAt: '2024-06-15T14:00:00.000Z',
    ...overrides,
  };
}

describe('computeHistoryStats', () => {
  it('returns zeros for empty input', () => {
    const stats = computeHistoryStats([]);
    expect(stats.totalWatched).toBe(0);
    expect(stats.estimatedHours).toBe(0);
    expect(stats.lateNightPercent).toBe(0);
    expect(stats.longestBingeStreak).toBe(0);
    expect(stats.topWatchedChannels).toEqual([]);
  });

  it('counts total watched and estimates hours', () => {
    const entries = Array.from({ length: 15 }, (_, i) =>
      makeEntry({ videoId: `v${i}` }),
    );
    const stats = computeHistoryStats(entries);
    expect(stats.totalWatched).toBe(15);
    expect(stats.estimatedHours).toBe(2); // 15 * 8min / 60 = 2
  });

  it('calculates late night percentage', () => {
    const entries = [
      makeEntry({ watchedAt: '2024-06-15T01:00:00.000Z' }), // 1am - late
      makeEntry({ watchedAt: '2024-06-15T03:30:00.000Z' }), // 3:30am - late
      makeEntry({ watchedAt: '2024-06-15T14:00:00.000Z' }), // 2pm - not late
      makeEntry({ watchedAt: '2024-06-15T22:00:00.000Z' }), // 10pm - not late
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.lateNightPercent).toBe(50);
  });

  it('detects binge streaks', () => {
    // 5 videos within 1 hour of each other
    const entries = [
      makeEntry({ watchedAt: '2024-06-15T10:00:00.000Z' }),
      makeEntry({ watchedAt: '2024-06-15T10:15:00.000Z' }),
      makeEntry({ watchedAt: '2024-06-15T10:30:00.000Z' }),
      makeEntry({ watchedAt: '2024-06-15T10:45:00.000Z' }),
      makeEntry({ watchedAt: '2024-06-15T11:00:00.000Z' }),
      // 3 hour gap
      makeEntry({ watchedAt: '2024-06-15T14:00:00.000Z' }),
      makeEntry({ watchedAt: '2024-06-15T14:20:00.000Z' }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.longestBingeStreak).toBe(5);
  });

  it('ranks top watched channels', () => {
    const entries = [
      makeEntry({ channelName: 'Alpha' }),
      makeEntry({ channelName: 'Alpha' }),
      makeEntry({ channelName: 'Alpha' }),
      makeEntry({ channelName: 'Beta' }),
      makeEntry({ channelName: 'Beta' }),
      makeEntry({ channelName: 'Gamma' }),
    ];
    const stats = computeHistoryStats(entries);
    expect(stats.topWatchedChannels[0]).toEqual({ name: 'Alpha', count: 3 });
    expect(stats.topWatchedChannels[1]).toEqual({ name: 'Beta', count: 2 });
    expect(stats.topWatchedChannels[2]).toEqual({ name: 'Gamma', count: 1 });
  });

  it('limits top channels to 15', () => {
    const entries = Array.from({ length: 20 }, (_, i) =>
      makeEntry({ channelName: `Channel ${i}` }),
    );
    const stats = computeHistoryStats(entries);
    expect(stats.topWatchedChannels.length).toBe(15);
  });

  it('handles entries with missing watchedAt', () => {
    const entries = [
      makeEntry({ watchedAt: '' }),
      makeEntry({ watchedAt: '2024-06-15T02:00:00.000Z' }),
    ];
    // Should not throw
    const stats = computeHistoryStats(entries);
    expect(stats.totalWatched).toBe(2);
  });
});
