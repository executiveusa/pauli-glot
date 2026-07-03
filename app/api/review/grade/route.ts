import { NextRequest, NextResponse } from 'next/server';

// Demo review grading — database disabled for development
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { srsItemId, rating } = body;

    if (!srsItemId || !rating || ![1, 2, 3, 4].includes(Number(rating))) {
      return NextResponse.json(
        { error: 'Invalid request: srsItemId and rating (1-4) required' },
        { status: 400 }
      );
    }

    const feedbackMap: Record<number, string> = {
      1: "No worries, we'll review this again soon.",
      2: 'This one needs more practice. Good effort!',
      3: "Great! You're building fluency with this pattern.",
      4: "Excellent! You've mastered this.",
    };

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (5 - rating));

    return NextResponse.json({
      success: true,
      feedback: feedbackMap[rating] ?? '',
      nextReviewAt: nextReview,
      reviewCount: 1,
    });
  } catch (error) {
    console.error('[review/grade]', error);
    return NextResponse.json({ error: 'Failed to grade review' }, { status: 500 });
  }
}
