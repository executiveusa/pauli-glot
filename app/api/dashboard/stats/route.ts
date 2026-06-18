import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo-user';

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
      // Completed story sessions
      prisma.storySession.count({
        where: { userId, completedAt: { not: null } },
      }),
      // Items currently due
      prisma.sRSItem.count({
        where: { userId, nextReviewAt: { lte: now } },
      }),
      // Review events in the last 7 days
      prisma.reviewEvent.count({
        where: { userId, createdAt: { gte: weekAgo } },
      }),
      // Total SRS items
      prisma.sRSItem.count({ where: { userId } }),
      // Items reviewed at least once (= learned)
      prisma.sRSItem.count({
        where: { userId, reviewCount: { gt: 0 } },
      }),
      // Learner state for comprehension score
      prisma.learnerState.findUnique({ where: { userId } }),
    ]);

    // Weekly progress = reviews done this week / (reviews + remaining due) as %
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
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
