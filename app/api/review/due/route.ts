import { NextResponse } from 'next/server';

// Demo review items — database disabled for development
export async function GET() {
  return NextResponse.json({
    dueItems: [
      {
        id: 'demo-1',
        itemType: 'vocabulary',
        content: 'hablar',
        answer: 'to speak',
        sourceStory: 'Juan habla español',
        difficulty: 2.5,
      },
      {
        id: 'demo-2',
        itemType: 'phrase',
        content: 'tener que + infinitive',
        answer: 'have to / must',
        sourceStory: 'Tengo que ir al trabajo',
        difficulty: 1.8,
      },
    ],
    schedule: {
      today: 5,
      tomorrow: 3,
      thisWeek: 8,
      later: 12,
    },
  });
}
