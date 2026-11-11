// @ts-nocheck
import { google, youtube_v3 } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getYouTubeClient(userId: string) {
  // Look up the user's Google account tokens from the DB
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account?.access_token) {
    throw new Error('No Google account found for user');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  });

  // When tokens refresh, update the DB
  oauth2Client.on('tokens', async (newTokens) => {
    await prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: account.providerAccountId,
        },
      },
      data: {
        access_token: newTokens.access_token ?? account.access_token,
        refresh_token: newTokens.refresh_token ?? account.refresh_token,
        expires_at: newTokens.expiry_date
          ? Math.floor(newTokens.expiry_date / 1000)
          : account.expires_at,
      },
    });
  });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

export async function fetchLikedVideos(userId: string) {
  const youtube = await getYouTubeClient(userId);
  try {
    // 1. Get the user's channel to find the 'likes' playlist ID
    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      mine: true,
    });

    const channels = channelResponse.data.items;
    if (!channels || channels.length === 0) {
      throw new Error('No channel found for the authenticated user.');
    }

    const likedPlaylistId = channels[0].contentDetails?.relatedPlaylists?.likes;

    if (!likedPlaylistId) {
      throw new Error('Liked playlist ID not found.');
    }

    let allVideos: youtube_v3.Schema$PlaylistItem[] = [];
    let nextPageToken: string | undefined | null = undefined;

    // 2. Fetch the items inside the liked videos playlist
    do {
      const playlistItemsResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: likedPlaylistId,
        maxResults: 50, // Adjust pagination as needed (max 50 per page)
        pageToken: nextPageToken || undefined,
      });
      const items = playlistItemsResponse.data.items || [];
      allVideos = allVideos.concat(items);

      // Extract the token for the next page (will be undefined on the last page)
      nextPageToken = playlistItemsResponse.data.nextPageToken;

      console.log(
        `Fetched ${items.length} items. Total so far: ${allVideos.length}`,
      );
    } while (nextPageToken && allVideos.length < 200);

    return allVideos;
  } catch (error) {
    console.error('Error fetching liked videos:', error);
    throw error;
  }
}

export async function fetchSubscriptions(userId: string) {
  const youtube = await getYouTubeClient(userId);
  let allSubs: youtube_v3.Schema$Subscription[] = [];
  let nextPageToken: string | undefined | null = undefined;

  do {
    const response = await youtube.subscriptions.list({
      part: ['snippet'],
      mine: true,
      maxResults: 50,
      pageToken: nextPageToken || undefined,
    });
    const items = response.data.items || [];
    allSubs = allSubs.concat(items);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken && allSubs.length < 200);

  return allSubs;
}

export async function fetchChannelInfo(userId: string) {
  const youtube = await getYouTubeClient(userId);
  const response = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    mine: true,
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error('No channel found for the authenticated user.');
  }
  return channel;
}

export async function fetchPlaylists(userId: string) {
  const youtube = await getYouTubeClient(userId);
  let allPlaylists: youtube_v3.Schema$Playlist[] = [];
  let nextPageToken: string | undefined | null = undefined;

  do {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50,
      pageToken: nextPageToken || undefined,
    });
    const items = response.data.items || [];
    allPlaylists = allPlaylists.concat(items);
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  return allPlaylists;
}

// Batch fetch video details (duration, categoryId) for a list of video IDs
// videos.list accepts up to 50 IDs per call
export async function fetchVideoDetails(userId: string, videoIds: string[]) {
  const youtube = await getYouTubeClient(userId);
  const details = new Map<string, youtube_v3.Schema$Video>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const response = await youtube.videos.list({
      part: ['contentDetails', 'snippet'],
      id: batch,
    });
    for (const item of response.data.items || []) {
      if (item.id) {
        details.set(item.id, item);
      }
    }
  }

  return details;
}
