// FSRS (Free Spaced Repetition Scheduler) v5 implementation
// Simplified version based on the FSRS algorithm

export interface FSRSMetrics {
  difficulty: number;
  stability: number;
  retrievability: number;
  nextReviewAt: Date;
}

export interface ReviewGrade {
  rating: 1 | 2 | 3 | 4;
  responseTime?: number;
}

const weights = {
  difficulty: [0.40, 0.50, 0.60, 0.70],
  stability: [0.35, 0.70, 1.20, 2.50],
  hardPenalty: 0.60,
  easyBonus: 1.30,
};

export function calculateNextReview(
  metrics: FSRSMetrics,
  grade: ReviewGrade,
): FSRSMetrics {
  const { difficulty, stability, retrievability } = metrics;
  const { rating } = grade;

  // Update difficulty based on response quality
  const newDifficulty = Math.max(
    0,
    Math.min(
      10,
      difficulty + weights.difficulty[rating - 1] - 2,
    ),
  );

  // Calculate retrievability decay
  const interval = Math.ceil((metrics.nextReviewAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const decay = Math.pow(0.9, interval / 36);
  const newRetrievability = retrievability * decay;

  // Update stability based on response quality
  let newStability = stability;
  if (rating === 1) {
    newStability = stability * weights.hardPenalty;
  } else if (rating === 2) {
    newStability = stability * 1.0;
  } else if (rating === 3) {
    newStability = stability * (1 + weights.stability[rating - 1]);
  } else if (rating === 4) {
    newStability = stability * (1 + weights.stability[rating - 1] * weights.easyBonus);
  }

  // Calculate next review interval
  let interval_days = 1;
  if (newRetrievability < 0.9 && rating >= 2) {
    interval_days = Math.ceil(newStability);
  } else if (rating === 1) {
    interval_days = 1;
  } else {
    interval_days = Math.ceil(newStability * (1 + 2 * Math.random()));
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval_days);

  return {
    difficulty: newDifficulty,
    stability: newStability,
    retrievability: newRetrievability,
    nextReviewAt,
  };
}

export function initializeFSRS(): FSRSMetrics {
  return {
    difficulty: 5.0,
    stability: 0.0,
    retrievability: 1.0,
    nextReviewAt: new Date(), // Review immediately when created
  };
}

export function getDueItems(items: Array<{ nextReviewAt: Date }>) {
  const now = new Date();
  return items.filter(item => item.nextReviewAt <= now);
}

export function getScheduleDistribution(items: Array<{ nextReviewAt: Date }>) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let today_count = 0;
  let tomorrow_count = 0;
  let week_count = 0;
  let later_count = 0;

  for (const item of items) {
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

  return { today_count, tomorrow_count, week_count, later_count };
}
