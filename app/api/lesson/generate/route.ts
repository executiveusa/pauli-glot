import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/ai/story-generator';
import { scoreComprehensibility } from '@/lib/ai/comprehensibility-scorer';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      learnerLevel = 'A2',
      targetStructures = ['tener que + infinitive', 'ir + a'],
      personalizedContext,
      userId = 'demo-user',
    } = body;

    if (!targetStructures || targetStructures.length === 0) {
      return NextResponse.json(
        { error: 'Target structures are required' },
        { status: 400 }
      );
    }

    // Generate story using OpenAI
    const story = await generateStory({
      learnerLevel,
      targetStructures,
      personalizedContext,
      tone: 'conversational',
    });

    // Score comprehensibility of Phase A
    const comprehensibilityScore = await scoreComprehensibility(
      story.phaseA,
      learnerLevel,
      personalizedContext
    );

    if (!comprehensibilityScore.isComprehensible) {
      // If not comprehensible enough, we could regenerate, but for MVP, warn the user
      console.warn('Generated story may not be comprehensible enough:', comprehensibilityScore);
    }

    // Save to database
    const storyModule = await prisma.storyModule.create({
      data: {
        title: `Lesson: ${targetStructures.join(', ')}`,
        phaseA: story.phaseA,
        phaseB: story.phaseB,
        phaseC: story.phaseC,
        targetStructures,
        knownVocabPct: comprehensibilityScore.knownVocabPercentage,
        unknownVocabPct: comprehensibilityScore.unknownVocabPercentage,
        difficulty: learnerLevel,
        contentSource: 'generated',
        personalizedFor: personalizedContext ? userId : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      story: {
        id: storyModule.id,
        title: storyModule.title,
        phaseA: storyModule.phaseA,
        phaseB: storyModule.phaseB,
        phaseC: storyModule.phaseC,
        targetStructures: storyModule.targetStructures,
        difficulty: storyModule.difficulty,
        comprehensibilityScore: {
          overallScore: comprehensibilityScore.overallScore,
          isComprehensible: comprehensibilityScore.isComprehensible,
          reasoning: comprehensibilityScore.reasoning,
        },
      },
    });
  } catch (error) {
    console.error('Error generating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson. Please check your API key.' },
      { status: 500 }
    );
  }
}
