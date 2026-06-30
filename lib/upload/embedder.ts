import { getOpenAI } from '@/lib/openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 20; // embed up to 20 chunks per API call

export async function embedChunks(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const all: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Preserve order from API response
    const sorted = response.data.sort((a, b) => a.index - b.index);
    all.push(...sorted.map(d => d.embedding));
  }

  return all;
}

export async function embedQuery(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}
