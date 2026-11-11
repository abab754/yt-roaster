import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import {
    fetchLikedVideos,
    fetchSubscriptions,
    fetchChannelInfo,
    fetchPlaylists,
    fetchVideoDetails,
} from '@/lib/youtube';
import {
    normalizeVideos,
    normalizeSubscriptions,
    normalizePlaylists,
    buildUserProfile,
} from '@/lib/profile';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(){
    // Auth Check
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const userId = session.user.id;

    // Check Cache
    const cached = await prisma.profile.findUnique({where: {userId}});
    if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS){
        return NextResponse.json(cached.data);
    }

    // Fetch fresh data from youtube
    const [channel, likedItems, subs, playlists] = await Promise.all([
        fetchChannelInfo(userId),
        fetchLikedVideos(userId),
        fetchSubscriptions(userId),
        fetchPlaylists(userId),
    ]);

    const videoIds = likedItems
        .map((item) => item.contentDetails?.videoId)
        .filter((id): id is string => !!id);
    const videoDetails = await fetchVideoDetails(userId, videoIds);

    // 5. Normalize and build profile                                                                            
    const videos = normalizeVideos(likedItems, videoDetails);                                                    
    const subscriptions = normalizeSubscriptions(subs);                                                          
    const playlistSummaries = normalizePlaylists(playlists);                                                     
    const profile = buildUserProfile(channel, videos, subscriptions, playlistSummaries);

    // 6. Save to cache                                                                                          
    await prisma.profile.upsert({                                                                                
      where: { userId },                                                                                         
      update: { data: profile as unknown as Prisma.InputJsonValue, fetchedAt: new Date() },
      create: { userId, data: profile as unknown as Prisma.InputJsonValue },                                                                         
    });                                                                                                          
                                                                                                                 
    return NextResponse.json(profile);
}   