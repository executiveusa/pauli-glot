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
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      completedLessons,
      dueReviews,
      weeklyReviews,
      totalItems,
      reviewedItems,
      learnerState,
    ] = await Promise.all([
      prisma.storySession.count({
        where: { userId: user.id, completedAt: { not: null } },
      }),
      prisma.sRSItem.count({
        where: { userId: user.id, nextReviewAt: { lte: now } },
      }),
      prisma.reviewEvent.count({
        where: { userId: user.id, createdAt: { gte: weekAgo } },
      }),
      prisma.sRSItem.count({ where: { userId: user.id } }),
      prisma.sRSItem.count({
        where: { userId: user.id, reviewCount: { gt: 0 } },
      }),
      prisma.learnerState.findUnique({ where: { userId: user.id } }),
    ]);

    const weeklyDenominator = weeklyReviews + dueReviews;
    const thisWeekProgress =
      weeklyDenominator > 0
        ? Math.round((weeklyReviews / weeklyDenominator) * 100)
        : 0;

    const averageComprehension =
      learnerState?.comprehensionScore != null
        ? Math.round(learnerState.comprehensionScore * 100)
        : totalItems > 0
        ? Math.round((reviewedItems / totalItems) * 100)
        : 0;

    return NextResponse.json({
      completedLessons,
      dueReviews,
      thisWeekProgress,
      totalStructuresLearned: reviewedItems,
      averageComprehension,
    });
  } catch (error) {
    console.error('[dashboard/stats]', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
