import { youtube_v3 } from 'googleapis';
import {
  VideoSummary,
  Subscription,
  PlaylistSummary,
  ProfileStats,
  UserProfile,
} from './types';

// YouTube category ID -> name mapping
// From https://developers.google.com/youtube/v3/docs/videoCategories/list
const CATEGORY_MAP: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '18': 'Short Movies',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '21': 'Videoblogging',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
};

const SHORTS_THRESHOLD_SECONDS = 60;

export function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function normalizeVideos(
  playlistItems: youtube_v3.Schema$PlaylistItem[],
  videoDetails: Map<string, youtube_v3.Schema$Video>,
): VideoSummary[] {
  return playlistItems
    .map((item) => {
      const videoId = item.contentDetails?.videoId ?? '';
      const detail = videoDetails.get(videoId);
      const durationSeconds = detail?.contentDetails?.duration
        ? parseDuration(detail.contentDetails.duration)
        : 0;
      const categoryId = detail?.snippet?.categoryId ?? '';

      return {
        videoId,
        title: item.snippet?.title ?? 'Unknown',
        channelName: item.snippet?.videoOwnerChannelTitle ?? 'Unknown',
        categoryId,
        categoryName: CATEGORY_MAP[categoryId] ?? 'Other',
        durationSeconds,
        publishedAt: item.snippet?.publishedAt ?? '',
        isShort:
          durationSeconds > 0 && durationSeconds <= SHORTS_THRESHOLD_SECONDS,
      };
    })
    .filter((v) => v.videoId !== '');
}

export function normalizeSubscriptions(
  subs: youtube_v3.Schema$Subscription[],
): Subscription[] {
  return subs.map((sub) => ({
    channelId: sub.snippet?.resourceId?.channelId ?? '',
    channelTitle: sub.snippet?.title ?? 'Unknown',
    description: sub.snippet?.description ?? '',
  }));
}

export function normalizePlaylists(
  playlists: youtube_v3.Schema$Playlist[],
): PlaylistSummary[] {
  return playlists.map((pl) => ({
    id: pl.id ?? '',
    title: pl.snippet?.title ?? 'Untitled',
    itemCount: pl.contentDetails?.itemCount ?? 0,
  }));
}

export function computeStats(
  videos: VideoSummary[],
  subscriptions: Subscription[],
  playlists: PlaylistSummary[],
): ProfileStats {
  // Top channels by liked video count
  const channelCounts = new Map<string, number>();
  for (const v of videos) {
    channelCounts.set(
      v.channelName,
      (channelCounts.get(v.channelName) ?? 0) + 1,
    );
  }
  const topChannels = [...channelCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Category breakdown
  const categoryCounts = new Map<string, number>();
  for (const v of videos) {
    categoryCounts.set(
      v.categoryName,
      (categoryCounts.get(v.categoryName) ?? 0) + 1,
    );
  }
  const categoryBreakdown = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  // Average duration
  const totalDuration = videos.reduce((sum, v) => sum + v.durationSeconds, 0);
  const avgVideoDurationSeconds =
    videos.length > 0 ? Math.round(totalDuration / videos.length) : 0;

  // Shorts vs long form
  const shorts = videos.filter((v) => v.isShort).length;

  return {
    totalLiked: videos.length,
    totalSubscriptions: subscriptions.length,
    totalPlaylists: playlists.length,
    topChannels,
    categoryBreakdown,
    avgVideoDurationSeconds,
    shortsVsLongForm: { shorts, long: videos.length - shorts },
  };
}

export function buildUserProfile(
  channel: youtube_v3.Schema$Channel,
  videos: VideoSummary[],
  subscriptions: Subscription[],
  playlists: PlaylistSummary[],
): UserProfile {
  return {
    channelName: channel.snippet?.title ?? 'Unknown',
    channelId: channel.id ?? '',
    subscriberCount: parseInt(channel.statistics?.subscriberCount ?? '0', 10),
    videoCount: parseInt(channel.statistics?.videoCount ?? '0', 10),
    viewCount: parseInt(channel.statistics?.viewCount ?? '0', 10),
    likedVideos: videos,
    subscriptions,
    playlists,
    stats: computeStats(videos, subscriptions, playlists),
  };
}
