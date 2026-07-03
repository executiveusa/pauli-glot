import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Lesson generation disabled for development
  // TODO: Re-enable when OpenAI and database are configured
  return NextResponse.json(
    {
      success: true,
      story: {
        id: 'demo-1',
        title: 'Demo Lesson: Present Tense',
        phaseA: 'En la mañana, María se despierta a las 7:00. Ella toma un café con leche. Luego, ella va al trabajo.',
        phaseB: 'Verbs in present tense: se despierta (wakes up), toma (drinks), va (goes)',
        phaseC: '¿A qué hora se despierta María? ¿Qué toma María?',
        targetStructures: ['present tense', 'daily routines'],
        difficulty: 'A1',
        comprehensibilityScore: {
          overallScore: 85,
          isComprehensible: true,
          reasoning: 'Simple present tense with context clues',
        },
      },
    },
    { status: 200 }
  );
}
