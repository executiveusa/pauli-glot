import OpenAI from 'openai';

let client: OpenAI | undefined;

// Lazy singleton — instantiating at module load time breaks Next.js's
// build-time page data collection when OPENAI_API_KEY isn't set yet.
export function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
