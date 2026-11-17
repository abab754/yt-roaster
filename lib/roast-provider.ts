import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface RoastProvider {
  generateRoast(prompt: string): Promise<string>;
}

class ClaudeProvider implements RoastProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateRoast(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error(
        `No text in response. Got: ${response.content.map((b) => b.type).join(', ')}`,
      );
    }
    return textBlock.text;
  }
}

class GeminiProvider implements RoastProvider {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateRoast(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

export function getRoastProvider(): RoastProvider {
  const provider = process.env.ROAST_PROVIDER ?? 'claude';
  if (provider === 'gemini') return new GeminiProvider();
  return new ClaudeProvider();
}
