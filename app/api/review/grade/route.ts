import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calculateNextReview } from '@/lib/fsrs/scheduler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      srsItemId,
      userId = 'demo-user',
      rating,
      responseTime,
      response,
    } = body;

    if (!srsItemId || !rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid request: srsItemId and rating (1-4) required' },
        { status: 400 }
      );
    }

    // Get the item
    const item = await prisma.sRSItem.findUnique({
      where: { id: srsItemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate next review using FSRS
    const metrics = {
      difficulty: item.difficulty,
      stability: item.stability,
      retrievability: item.retrievability,
      nextReviewAt: item.nextReviewAt,
    };

    const updatedMetrics = calculateNextReview(metrics, {
      rating: rating as 1 | 2 | 3 | 4,
      responseTime,
    });

    // Record the review
    const reviewEvent = await prisma.reviewEvent.create({
      data: {
        userId,
        srsItemId,
        rating,
        responseTime,
        response,
      },
    });

    // Update the SRS item
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

    // Determine feedback
    let feedback = '';
    if (rating === 1) {
      feedback = 'No worries, we\'ll review this again soon.';
    } else if (rating === 2) {
      feedback = 'This one needs more practice. Good effort!';
    } else if (rating === 3) {
      feedback = 'Great! You\'re building fluency with this pattern.';
    } else {
      feedback = 'Excellent! You\'ve mastered this.';
    }

    return NextResponse.json({
      success: true,
      feedback,
      nextReviewAt: updatedItem.nextReviewAt,
      reviewCount: updatedItem.reviewCount,
    });
  } catch (error) {
    console.error('Error grading review:', error);
    return NextResponse.json(
      { error: 'Failed to grade review' },
      { status: 500 }
    );
  }
}
