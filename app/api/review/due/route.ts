import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getOrCreateUser } from '@/lib/auth';

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueItems = await prisma.sRSItem.findMany({
      where: { userId: user.id, nextReviewAt: { lte: now } },
      take: 20,
      orderBy: { difficulty: 'asc' },
    });

    // Use DB aggregation instead of in-memory loop
    const allItems = await prisma.sRSItem.findMany({
      where: { userId: user.id },
      select: { nextReviewAt: true },
    });

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
    console.error('[review/due]', error);
    return NextResponse.json({ error: 'Failed to fetch due reviews' }, { status: 500 });
  }
}
