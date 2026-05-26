import { NextRequest, NextResponse } from 'next/server';
import { searchChunks, buildContext } from '@/lib/rag/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      userId = 'demo-user',
      topK = 5,
      contextOnly = false, // if true, return assembled context string
    } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 },
      );
    }

    if (contextOnly) {
      const context = await buildContext(query.trim(), userId, topK);
      return NextResponse.json({ context });
    }

    const results = await searchChunks(query.trim(), userId, topK);

    return NextResponse.json({
      results: results.map(r => ({
        chunkId: r.chunkId,
        content: r.content,
        score: Math.round(r.score * 1000) / 1000,
        difficulty: r.difficulty,
      })),
      count: results.length,
    });
  } catch (error) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 },
    );
  }
}
