import { NextResponse } from 'next/server';

// Demo stats — database disabled for development
export async function GET() {
  return NextResponse.json({
    completedLessons: 3,
    dueReviews: 5,
    thisWeekProgress: 72,
    totalStructuresLearned: 12,
    averageComprehension: 82,
  });
}
