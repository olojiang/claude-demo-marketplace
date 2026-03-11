import { GoogleGenAI } from '@google/genai';

export const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const GROUNDING_TOOL = { googleSearch: {} };

export function createClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({ apiKey });
}
