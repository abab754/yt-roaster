import { describe, it, expect, vi } from 'vitest';
import { roastSchema } from '../lib/roast-schema';
import { buildRoastPrompt } from '../lib/roast-prompt';
import type { UserProfile } from '../lib/types';

const mockProfile: UserProfile = {
  channelName: 'TestUser',
  channelId: 'UC123',
  subscriberCount: 10,
  videoCount: 5,
  viewCount: 100,
  likedVideos: [
    {
      videoId: '1',
      title: 'Video One',
      channelName: 'ChA',
      categoryId: '27',
      categoryName: 'Education',
      durationSeconds: 600,
      publishedAt: '',
      isShort: false,
    },
    {
      videoId: '2',
      title: 'Video Two',
      channelName: 'ChB',
      categoryId: '20',
      categoryName: 'Gaming',
      durationSeconds: 30,
      publishedAt: '',
      isShort: true,
    },
  ],
  subscriptions: [{ channelId: 'c1', channelTitle: 'ChA', description: '' }],
  playlists: [],
  stats: {
    totalLiked: 2,
    totalSubscriptions: 1,
    totalPlaylists: 0,
    topChannels: [
      { name: 'ChA', count: 1 },
      { name: 'ChB', count: 1 },
    ],
    categoryBreakdown: [
      { category: 'Education', count: 1 },
      { category: 'Gaming', count: 1 },
    ],
    avgVideoDurationSeconds: 315,
    shortsVsLongForm: { shorts: 1, long: 1 },
  },
};

describe('roastSchema', () => {
  it('validates a correct roast result', () => {
    const valid = {
      brainrotScore: { score: 42, justification: 'Moderate brainrot' },
      personalityArchetype: 'The Tutorial Hoarder',
      roastParagraphs: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3'],
      worstOffenders: [{ name: 'ChA', reason: 'Too educational' }],
      redemptionArc: 'At least they watch some educational content',
      statsHighlights: ['Only 2 liked videos, commitment issues'],
    };
    expect(() => roastSchema.parse(valid)).not.toThrow();
  });

  it('rejects score out of range', () => {
    const invalid = {
      brainrotScore: { score: 150, justification: 'Over the top' },
      personalityArchetype: 'Test',
      roastParagraphs: ['a', 'b', 'c'],
      worstOffenders: [],
      redemptionArc: 'None',
      statsHighlights: [],
    };
    expect(() => roastSchema.parse(invalid)).toThrow();
  });

  it('rejects fewer than 3 roast paragraphs', () => {
    const invalid = {
      brainrotScore: { score: 50, justification: 'Mid' },
      personalityArchetype: 'Test',
      roastParagraphs: ['Only one'],
      worstOffenders: [],
      redemptionArc: 'None',
      statsHighlights: [],
    };
    expect(() => roastSchema.parse(invalid)).toThrow();
  });

  it('rejects missing fields', () => {
    expect(() => roastSchema.parse({})).toThrow();
    expect(() => roastSchema.parse({ brainrotScore: { score: 50 } })).toThrow();
  });
});

describe('buildRoastPrompt', () => {
  it('includes key profile data in the prompt', () => {
    const prompt = buildRoastPrompt(mockProfile);
    expect(prompt).toContain('TestUser');
    expect(prompt).toContain('ChA');
    expect(prompt).toContain('Video One');
    expect(prompt).toContain('Education');
    expect(prompt).toContain('Gaming');
  });

  it('includes history stats when provided', () => {
    const history = {
      totalWatched: 5000,
      estimatedHours: 667,
      lateNightPercent: 30,
      longestBingeStreak: 12,
      topWatchedChannels: [{ name: 'BingeChannel', count: 200 }],
    };
    const prompt = buildRoastPrompt(mockProfile, history);
    expect(prompt).toContain('5000');
    expect(prompt).toContain('667');
    expect(prompt).toContain('30%');
    expect(prompt).toContain('12 videos in a row');
    expect(prompt).toContain('BingeChannel');
  });

  it('excludes history section when not provided', () => {
    const prompt = buildRoastPrompt(mockProfile);
    expect(prompt).not.toContain('WATCH HISTORY');
  });

  it('limits sample titles', () => {
    const bigProfile = {
      ...mockProfile,
      likedVideos: Array.from({ length: 100 }, (_, i) => ({
        videoId: `v${i}`,
        title: `Video ${i}`,
        channelName: 'Ch',
        categoryId: '20',
        categoryName: 'Gaming',
        durationSeconds: 300,
        publishedAt: '',
        isShort: false,
      })),
    };
    const prompt = buildRoastPrompt(bigProfile);
    // Should contain Video 0 through 39 but not Video 40+
    expect(prompt).toContain('Video 39');
    expect(prompt).not.toContain('Video 40');
  });
});
