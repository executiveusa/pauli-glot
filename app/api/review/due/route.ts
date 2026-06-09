import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get items due for review
    const dueItems = await prisma.sRSItem.findMany({
      where: {
        userId,
        nextReviewAt: {
          lte: new Date(), // Due now or before
        },
      },
      take: limit,
      orderBy: {
        difficulty: 'asc', // Review easier items first
      },
    });

    // Get schedule distribution
    const allItems = await prisma.sRSItem.findMany({
      where: { userId },
      select: { nextReviewAt: true },
    });

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let today_count = 0;
    let tomorrow_count = 0;
    let week_count = 0;
    let later_count = 0;

    for (const item of allItems) {
      const itemDate = new Date(item.nextReviewAt);
      itemDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 0) today_count++;
      else if (daysDiff === 1) tomorrow_count++;
      else if (daysDiff <= 7) week_count++;
      else later_count++;
    }

    return NextResponse.json({
      dueItems: dueItems.map(item => ({
        id: item.id,
        itemType: item.itemType,
        content: item.content,
        answer: item.answer,
        sourceStory: item.sourceStory,
        difficulty: item.difficulty,
      })),
      schedule: {
        today: today_count,
        tomorrow: tomorrow_count,
        thisWeek: week_count,
        later: later_count,
      },
    });
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due reviews' },
      { status: 500 }
    );
  }
}
