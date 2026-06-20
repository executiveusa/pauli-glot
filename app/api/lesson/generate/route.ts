import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/ai/story-generator';
import { scoreComprehensibility } from '@/lib/ai/comprehensibility-scorer';
import { buildContext } from '@/lib/rag/search';
import { prisma } from '@/lib/db/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`lesson:${user.id}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached. Max 10 lessons per hour.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      learnerLevel = 'A2',
      targetStructures = ['tener que + infinitive', 'ir + a'],
      personalizedContext,
    } = body;

    if (!targetStructures || targetStructures.length === 0) {
      return NextResponse.json(
        { error: 'Target structures are required' },
        { status: 400 }
      );
    }

    const ragQuery = [...(targetStructures ?? []), personalizedContext ?? '']
      .filter(Boolean)
      .join(', ');

    let ragContext: string | undefined;
    try {
      ragContext = (await buildContext(ragQuery, user.id, 3)) || undefined;
    } catch {
      // RAG is optional
    }

    const story = await generateStory({
      learnerLevel,
      targetStructures,
      personalizedContext,
      ragContext,
      tone: 'conversational',
    });

    const comprehensibilityScore = await scoreComprehensibility(
      story.phaseA,
      learnerLevel,
      personalizedContext
    );

    const storyModule = await prisma.storyModule.create({
      data: {
        title: `Lesson: ${targetStructures.join(', ')}`,
        phaseA: story.phaseA,
        phaseB: story.phaseB,
        phaseC: story.phaseC,
        targetStructures: JSON.stringify(targetStructures),
        knownVocabPct: comprehensibilityScore.knownVocabPercentage,
        unknownVocabPct: comprehensibilityScore.unknownVocabPercentage,
        difficulty: learnerLevel,
        contentSource: 'generated',
        personalizedFor: personalizedContext ? user.id : undefined,
      },
    });

    // Create a story session to track lesson progress
    await prisma.storySession.create({
      data: { userId: user.id, storyModuleId: storyModule.id },
    });

    return NextResponse.json({
      success: true,
      story: {
        id: storyModule.id,
        title: storyModule.title,
        phaseA: storyModule.phaseA,
        phaseB: storyModule.phaseB,
        phaseC: storyModule.phaseC,
        targetStructures: JSON.parse(storyModule.targetStructures || '[]'),
        difficulty: storyModule.difficulty,
        comprehensibilityScore: {
          overallScore: comprehensibilityScore.overallScore,
          isComprehensible: comprehensibilityScore.isComprehensible,
          reasoning: comprehensibilityScore.reasoning,
        },
      },
    });
  } catch (error) {
    console.error('[lesson/generate]', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson. Please check your API key.' },
      { status: 500 }
    );
  }
}
