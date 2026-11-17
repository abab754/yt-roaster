import type { UserProfile, HistoryStats } from './types';

const MAX_SAMPLE_TITLES = 40;

export function buildRoastPrompt(
  profile: UserProfile,
  historyStats?: HistoryStats | null,
): string {
  const { stats } = profile;

  // Sample of liked video titles (not all — keeps it cheap)
  const sampleTitles = profile.likedVideos
    .slice(0, MAX_SAMPLE_TITLES)
    .map((v) => `"${v.title}" by ${v.channelName}`)
    .join('\n');

  const topChannels = stats.topChannels
    .map((c) => `${c.name} (${c.count} likes)`)
    .join(', ');

  const categories = stats.categoryBreakdown
    .map((c) => `${c.category}: ${c.count}`)
    .join(', ');

  const subscriptions = profile.subscriptions
    .slice(0, 20)
    .map((s) => s.channelTitle)
    .join(', ');

  let historySection = '';
  if (historyStats) {
    historySection = `
WATCH HISTORY (from Google Takeout):
- Total videos watched: ${historyStats.totalWatched}
- Estimated hours spent: ${historyStats.estimatedHours}
- Late-night watching (12am-5am): ${historyStats.lateNightPercent}% of all videos
- Longest binge streak: ${historyStats.longestBingeStreak} videos in a row
- Most watched channels: ${historyStats.topWatchedChannels.map((c) => `${c.name} (${c.count})`).join(', ')}
`;
  }

  return `You are a savage YouTube roast comedian. Analyze this person's YouTube data and roast them mercilessly. Be funny, specific, and reference their actual channels and videos.

RULES:
- Be savage but not cruel. Punch up, not down.
- DO NOT make assumptions about race, gender, sexuality, disability, or mental health.
- DO NOT guess personal details from viewing habits.
- Reference specific channels and video titles from the data.
- The brainrotScore should reflect how much brainrot their feed indicates (0 = cultured, 100 = terminal brainrot).
- The personalityArchetype should be a funny label (e.g. "The Sigma Grindset Bro", "The Doomscroller", "The Tutorial Hoarder").

USER'S YOUTUBE DATA:
Channel: ${profile.channelName}
Total liked videos: ${stats.totalLiked}
Total subscriptions: ${stats.totalSubscriptions}
Average video duration: ${Math.round(stats.avgVideoDurationSeconds / 60)} minutes
Shorts vs long-form: ${stats.shortsVsLongForm.shorts} shorts, ${stats.shortsVsLongForm.long} long-form

Top liked channels: ${topChannels}
Category breakdown: ${categories}
Subscriptions: ${subscriptions}
${historySection}
SAMPLE OF LIKED VIDEO TITLES:
${sampleTitles}

Respond with ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "brainrotScore": { "score": <0-100>, "justification": "<why this score>" },
  "personalityArchetype": "<funny label>",
  "roastParagraphs": ["<paragraph 1>", "<paragraph 2>", "<paragraph 3>"],
  "worstOffenders": [{ "name": "<channel or video>", "reason": "<why it's bad>" }],
  "redemptionArc": "<the one good thing about their taste>",
  "statsHighlights": ["<funny stat observation 1>", "<funny stat observation 2>"]
}`;
}
