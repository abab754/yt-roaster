import type { UserProfile, HistoryStats } from './types';
import { roastSchema, type RoastResult } from './roast-schema';
import { getRoastProvider } from './roast-provider';
import { buildRoastPrompt } from './roast-prompt';

function extractJson(text: string): string {
  // Strip markdown code fences if the LLM wraps the response
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

export async function generateRoast(
  profile: UserProfile,
  historyStats?: HistoryStats | null,
): Promise<RoastResult> {
  const provider = getRoastProvider();
  const prompt = buildRoastPrompt(profile, historyStats);

  let lastError: unknown;

  // Try twice — retry once if validation fails
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await provider.generateRoast(prompt);
      const json = JSON.parse(extractJson(raw));
      return roastSchema.parse(json);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}
