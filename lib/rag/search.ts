// Cosine similarity search over stored chunk embeddings
// Using in-memory computation since we're on SQLite (no pgvector)

import { prisma } from '@/lib/db/prisma';
import { embedQuery } from '@/lib/upload/embedder';

export interface SearchResult {
  chunkId: string;
  assetId: string;
  content: string;
  score: number;
  difficulty: string;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchChunks(
  query: string,
  userId: string,
  topK = 5,
): Promise<SearchResult[]> {
  // Get all chunks for this user's assets
  const assets = await prisma.uploadedAsset.findMany({
    where: { userId },
    select: { id: true },
  });

  if (assets.length === 0) return [];

  const assetIds = assets.map(a => a.id);

  const chunks = await prisma.assetChunk.findMany({
    where: {
      assetId: { in: assetIds },
      embedding: { not: null },
    },
    select: {
      id: true,
      assetId: true,
      content: true,
      embedding: true,
      difficulty: true,
    },
  });

  if (chunks.length === 0) return [];

  // Embed the query
  const queryVec = await embedQuery(query);

  // Score each chunk
  const scored = chunks
    .map(chunk => {
      const embeddingVec = JSON.parse(chunk.embedding!) as number[];
      return {
        chunkId: chunk.id,
        assetId: chunk.assetId,
        content: chunk.content,
        score: cosineSimilarity(queryVec, embeddingVec),
        difficulty: chunk.difficulty,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export async function buildContext(
  query: string,
  userId: string,
  topK = 3,
): Promise<string> {
  const results = await searchChunks(query, userId, topK);
  if (results.length === 0) return '';

  const context = results
    .map((r, i) => `[Source ${i + 1}]\n${r.content}`)
    .join('\n\n');

  return context;
}
