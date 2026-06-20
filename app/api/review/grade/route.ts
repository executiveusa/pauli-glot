import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calculateNextReview } from '@/lib/fsrs/scheduler';
import { getOrCreateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { srsItemId, rating, responseTime, response } = body;

    if (!srsItemId || !rating || ![1, 2, 3, 4].includes(Number(rating))) {
      return NextResponse.json(
        { error: 'Invalid request: srsItemId and rating (1-4) required' },
        { status: 400 }
      );
    }

    const item = await prisma.sRSItem.findUnique({ where: { id: srsItemId } });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedMetrics = calculateNextReview(
      {
        difficulty: item.difficulty,
        stability: item.stability,
        retrievability: item.retrievability,
        nextReviewAt: item.nextReviewAt,
      },
      { rating: rating as 1 | 2 | 3 | 4, responseTime }
    );

    await prisma.reviewEvent.create({
      data: { userId: user.id, srsItemId, rating: Number(rating), responseTime, response },
    });

    const updatedItem = await prisma.sRSItem.update({
      where: { id: srsItemId },
      data: {
        difficulty: updatedMetrics.difficulty,
        stability: updatedMetrics.stability,
        retrievability: updatedMetrics.retrievability,
        nextReviewAt: updatedMetrics.nextReviewAt,
        lastReviewAt: new Date(),
        reviewCount: { increment: 1 },
      },
    });

    const feedbackMap: Record<number, string> = {
      1: "No worries, we'll review this again soon.",
      2: 'This one needs more practice. Good effort!',
      3: "Great! You're building fluency with this pattern.",
      4: "Excellent! You've mastered this.",
    };

    return NextResponse.json({
      success: true,
      feedback: feedbackMap[rating] ?? '',
      nextReviewAt: updatedItem.nextReviewAt,
      reviewCount: updatedItem.reviewCount,
    });
  } catch (error) {
    console.error('[review/grade]', error);
    return NextResponse.json({ error: 'Failed to grade review' }, { status: 500 });
  }
}
