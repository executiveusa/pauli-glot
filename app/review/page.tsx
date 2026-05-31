'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DueItem {
  id: string;
  itemType: string;
  content: string;
  difficulty: number;
}

interface ReviewData {
  dueItems: DueItem[];
  schedule: {
    today: number;
    tomorrow: number;
    thisWeek: number;
    later: number;
  };
}

interface FeedbackMessage {
  text: string;
  nextReviewAt?: string;
}

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReviewData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const userId = 'demo-user'; // In a real app, get from session

  useEffect(() => {
    async function fetchDueItems() {
      try {
        const response = await fetch(
          `/api/review/due?userId=${userId}&limit=20`
        );
        if (!response.ok) throw new Error('Failed to fetch due items');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDueItems();
  }, [userId]);

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (!data || !data.dueItems[currentIndex]) return;

    const item = data.dueItems[currentIndex];
    setSubmitting(true);

    try {
      const response = await fetch('/api/review/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srsItemId: item.id,
          userId,
          rating,
          responseTime: 5000, // placeholder
        }),
      });

      if (!response.ok) throw new Error('Failed to grade review');

      const result = await response.json();
      setFeedback({
        text: result.feedback,
        nextReviewAt: result.nextReviewAt,
      });

      setTimeout(() => {
        if (currentIndex < data.dueItems.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setFeedback(null);
        } else {
          setFeedback({
            text: 'Great job! You\'ve completed all due reviews for now.',
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setFeedback({ text: 'Error submitting review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Review Items</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-12">
          <p className="text-gray-600">Loading due items...</p>
        </main>
      </div>
    );
  }

  if (!data || data.dueItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Review Items</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h2 className="font-bold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-700 mb-4">
              You have no items due for review right now. Great job keeping up
              with your studies!
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentItem = data.dueItems[currentIndex];
  const progress = `${currentIndex + 1} of ${data.dueItems.length}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Spaced Repetition Review
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Progress: {progress}
            </span>
            <span className="text-sm text-gray-500">
              Today: {data.schedule.today} | Tomorrow: {data.schedule.tomorrow} |
              This week: {data.schedule.thisWeek}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${((currentIndex + 1) / data.dueItems.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentItem.itemType}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {currentItem.content}
          </p>

          <p className="text-sm text-gray-500 mt-4">
            Difficulty: {currentItem.difficulty.toFixed(2)} / 5
          </p>
        </div>

        {feedback ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
            <p className="text-gray-700 font-semibold">{feedback.text}</p>
            {feedback.nextReviewAt && (
              <p className="text-sm text-gray-600 mt-2">
                Next review:{' '}
                {new Date(feedback.nextReviewAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-700 mb-6 text-center">
              How well did you know this? (Scale of 1-4)
            </p>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => handleRate(1)}
                disabled={submitting}
                className="py-4 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
              >
                1<br />
                <span className="text-xs">Forgot</span>
              </button>
              <button
                onClick={() => handleRate(2)}
                disabled={submitting}
                className="py-4 bg-yellow-100 text-yellow-700 font-bold rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition"
              >
                2<br />
                <span className="text-xs">Difficult</span>
              </button>
              <button
                onClick={() => handleRate(3)}
                disabled={submitting}
                className="py-4 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50 transition"
              >
                3<br />
                <span className="text-xs">Good</span>
              </button>
              <button
                onClick={() => handleRate(4)}
                disabled={submitting}
                className="py-4 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 disabled:opacity-50 transition"
              >
                4<br />
                <span className="text-xs">Easy</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
