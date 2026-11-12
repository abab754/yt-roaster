import type { TakeoutEntry, HistoryStats } from './types';

const AVG_VIDEO_MINUTES = 8;

export function computeHistoryStats(entries: TakeoutEntry[]): HistoryStats {
  if (entries.length === 0) {
    return {
      totalWatched: 0,
      estimatedHours: 0,
      lateNightPercent: 0,
      longestBingeStreak: 0,
      topWatchedChannels: [],
    };
  }

  // Total watched & estimated hours
  const totalWatched = entries.length;
  const estimatedHours = Math.round((totalWatched * AVG_VIDEO_MINUTES) / 60);

  // Late-night watching (12am - 5am)
  let lateNightCount = 0;
  for (const entry of entries) {
    if (!entry.watchedAt) continue;
    const hour = new Date(entry.watchedAt).getUTCHours();
    if (hour >= 0 && hour < 5) {
      lateNightCount++;
    }
  }
  const lateNightPercent = Math.round((lateNightCount / totalWatched) * 100);

  // Binge streaks (3+ videos within 1 hour)
  const timestamps = entries
    .filter((e) => e.watchedAt)
    .map((e) => new Date(e.watchedAt).getTime())
    .sort((a, b) => a - b);

  let longestBingeStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i] - timestamps[i - 1];
    if (gap <= 60 * 60 * 1000) {
      currentStreak++;
      longestBingeStreak = Math.max(longestBingeStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Top watched channels
  const channelCounts = new Map<string, number>();
  for (const entry of entries) {
    channelCounts.set(
      entry.channelName,
      (channelCounts.get(entry.channelName) ?? 0) + 1,
    );
  }
  const topWatchedChannels = [...channelCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));

  return {
    totalWatched,
    estimatedHours,
    lateNightPercent,
    longestBingeStreak,
    topWatchedChannels,
  };
}
