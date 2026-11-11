export interface VideoSummary {
  videoId: string;
  title: string;
  channelName: string;
  categoryId: string;
  categoryName: string;
  durationSeconds: number;
  publishedAt: string;
  isShort: boolean;
}

export interface Subscription {
  channelId: string;
  channelTitle: string;
  description: string;
}

export interface PlaylistSummary {
  id: string;
  title: string;
  itemCount: number;
}

export interface ProfileStats {
  totalLiked: number;
  totalSubscriptions: number;
  totalPlaylists: number;
  topChannels: { name: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  avgVideoDurationSeconds: number;
  shortsVsLongForm: { shorts: number; long: number };
}

export interface UserProfile {
  channelName: string;
  channelId: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  likedVideos: VideoSummary[];
  subscriptions: Subscription[];
  playlists: PlaylistSummary[];
  stats: ProfileStats;
}
