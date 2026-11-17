import 'dotenv/config';
import { generateRoast } from '../lib/roast';
import type { UserProfile } from '../lib/types';

const fixtures: Record<string, UserProfile> = {
  gamer: {
    channelName: 'xX_GamerBoi_Xx',
    channelId: 'UC123',
    subscriberCount: 12,
    videoCount: 0,
    viewCount: 0,
    likedVideos: [
      {
        videoId: '1',
        title: 'I Played Minecraft for 100 Days Straight',
        channelName: 'Dream',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 2400,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '2',
        title: 'Fortnite Season 47 Battle Pass Tier List',
        channelName: 'SypherPK',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 1200,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '3',
        title: 'Top 10 INSANE Valorant Clutches',
        channelName: 'GameLeap',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 600,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '4',
        title: 'GTA 6 Trailer Reaction LIVE',
        channelName: 'MrBeast Gaming',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 300,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '5',
        title: 'Is Elden Ring Actually Hard?',
        channelName: 'videogamedunkey',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 900,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '6',
        title: 'I Built a Redstone Computer in Minecraft',
        channelName: 'Mumbo Jumbo',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 1800,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '7',
        title: 'Sigma Male Montage #47',
        channelName: 'SigmaClips',
        categoryId: '24',
        categoryName: 'Entertainment',
        durationSeconds: 45,
        publishedAt: '',
        isShort: true,
      },
    ],
    subscriptions: [
      { channelId: 'c1', channelTitle: 'Dream', description: '' },
      { channelId: 'c2', channelTitle: 'SypherPK', description: '' },
      { channelId: 'c3', channelTitle: 'MrBeast Gaming', description: '' },
      { channelId: 'c4', channelTitle: 'videogamedunkey', description: '' },
    ],
    playlists: [],
    stats: {
      totalLiked: 7,
      totalSubscriptions: 4,
      totalPlaylists: 0,
      topChannels: [
        { name: 'Dream', count: 1 },
        { name: 'SypherPK', count: 1 },
        { name: 'GameLeap', count: 1 },
      ],
      categoryBreakdown: [
        { category: 'Gaming', count: 6 },
        { category: 'Entertainment', count: 1 },
      ],
      avgVideoDurationSeconds: 1035,
      shortsVsLongForm: { shorts: 1, long: 6 },
    },
  },

  financeBro: {
    channelName: 'HustleKing2024',
    channelId: 'UC456',
    subscriberCount: 3,
    videoCount: 0,
    viewCount: 0,
    likedVideos: [
      {
        videoId: '1',
        title: 'How I Made $10K/Month at 19',
        channelName: 'Graham Stephan',
        categoryId: '22',
        categoryName: 'People & Blogs',
        durationSeconds: 900,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '2',
        title: 'The TRUTH About Crypto in 2024',
        channelName: 'Andrei Jikh',
        categoryId: '27',
        categoryName: 'Education',
        durationSeconds: 1200,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '3',
        title: 'Why You Should NEVER Get a Job',
        channelName: 'Alex Hormozi',
        categoryId: '22',
        categoryName: 'People & Blogs',
        durationSeconds: 600,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '4',
        title: 'Day in My Life as a 22 Year Old Millionaire',
        channelName: 'Iman Gadzhi',
        categoryId: '22',
        categoryName: 'People & Blogs',
        durationSeconds: 800,
        publishedAt: '',
        isShort: false,
      },
      {
        videoId: '5',
        title: 'PASSIVE INCOME: 7 Side Hustles',
        channelName: 'Ali Abdaal',
        categoryId: '27',
        categoryName: 'Education',
        durationSeconds: 1500,
        publishedAt: '',
        isShort: false,
      },
    ],
    subscriptions: [
      { channelId: 'c1', channelTitle: 'Graham Stephan', description: '' },
      { channelId: 'c2', channelTitle: 'Alex Hormozi', description: '' },
      { channelId: 'c3', channelTitle: 'Iman Gadzhi', description: '' },
    ],
    playlists: [],
    stats: {
      totalLiked: 5,
      totalSubscriptions: 3,
      totalPlaylists: 0,
      topChannels: [
        { name: 'Graham Stephan', count: 1 },
        { name: 'Alex Hormozi', count: 1 },
        { name: 'Iman Gadzhi', count: 1 },
      ],
      categoryBreakdown: [
        { category: 'People & Blogs', count: 3 },
        { category: 'Education', count: 2 },
      ],
      avgVideoDurationSeconds: 1000,
      shortsVsLongForm: { shorts: 0, long: 5 },
    },
  },

  shortsAddict: {
    channelName: 'BrainrotCentral',
    channelId: 'UC789',
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    likedVideos: [
      {
        videoId: '1',
        title: 'Wait for it... 😂',
        channelName: 'Daily Dose Of Internet',
        categoryId: '24',
        categoryName: 'Entertainment',
        durationSeconds: 30,
        publishedAt: '',
        isShort: true,
      },
      {
        videoId: '2',
        title: 'POV: You explain memes to your mom',
        channelName: 'MemeLord',
        categoryId: '23',
        categoryName: 'Comedy',
        durationSeconds: 15,
        publishedAt: '',
        isShort: true,
      },
      {
        videoId: '3',
        title: 'This cat is UNREAL',
        channelName: 'Cats of TikTok',
        categoryId: '15',
        categoryName: 'Pets & Animals',
        durationSeconds: 20,
        publishedAt: '',
        isShort: true,
      },
      {
        videoId: '4',
        title: 'Satisfying slime compilation #892',
        channelName: 'OddlySatisfying',
        categoryId: '24',
        categoryName: 'Entertainment',
        durationSeconds: 45,
        publishedAt: '',
        isShort: true,
      },
      {
        videoId: '5',
        title: 'Subway Surfers + Family Guy = Content',
        channelName: 'BrainrotTV',
        categoryId: '24',
        categoryName: 'Entertainment',
        durationSeconds: 58,
        publishedAt: '',
        isShort: true,
      },
      {
        videoId: '6',
        title: 'Would you rather? IMPOSSIBLE edition',
        channelName: 'QuizTime',
        categoryId: '24',
        categoryName: 'Entertainment',
        durationSeconds: 40,
        publishedAt: '',
        isShort: true,
      },
    ],
    subscriptions: [
      {
        channelId: 'c1',
        channelTitle: 'Daily Dose Of Internet',
        description: '',
      },
      { channelId: 'c2', channelTitle: 'BrainrotTV', description: '' },
    ],
    playlists: [],
    stats: {
      totalLiked: 6,
      totalSubscriptions: 2,
      totalPlaylists: 0,
      topChannels: [
        { name: 'Daily Dose Of Internet', count: 1 },
        { name: 'BrainrotTV', count: 1 },
      ],
      categoryBreakdown: [
        { category: 'Entertainment', count: 4 },
        { category: 'Comedy', count: 1 },
        { category: 'Pets & Animals', count: 1 },
      ],
      avgVideoDurationSeconds: 35,
      shortsVsLongForm: { shorts: 6, long: 0 },
    },
  },
};

async function main() {
  const name = process.argv[2] || 'gamer';
  const profile = fixtures[name];

  if (!profile) {
    console.error(
      `Unknown fixture: ${name}. Available: ${Object.keys(fixtures).join(', ')}`,
    );
    process.exit(1);
  }

  console.log(`Roasting "${name}" profile...\n`);

  const roast = await generateRoast(profile);
  console.log(JSON.stringify(roast, null, 2));
}

main().catch(console.error);
