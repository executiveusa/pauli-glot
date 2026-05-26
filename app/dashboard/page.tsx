'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  completedLessons: number;
  dueReviews: number;
  thisWeekProgress: number;
  totalStructuresLearned: number;
  averageComprehension: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    completedLessons: 0,
    dueReviews: 0,
    thisWeekProgress: 0,
    totalStructuresLearned: 0,
    averageComprehension: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      completedLessons: 3,
      dueReviews: 12,
      thisWeekProgress: 45,
      totalStructuresLearned: 18,
      averageComprehension: 0.82,
    });
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">AcquisitionOS</h1>
          <nav className="space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/dashboard" className="text-blue-600 font-bold">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Your Learning Progress</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Completed Lessons</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completedLessons}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Due for Review</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.dueReviews}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">This Week</p>
            <p className="text-3xl font-bold text-purple-600">{stats.thisWeekProgress}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Structures Learned</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalStructuresLearned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Comprehension</p>
            <p className="text-3xl font-bold text-orange-600">
              {Math.round(stats.averageComprehension * 100)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h3>
            <div className="space-y-4">
              <Link
                href="/lesson/new"
                className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded hover:shadow transition"
              >
                <h4 className="font-bold text-gray-900">Start a New Lesson</h4>
                <p className="text-sm text-gray-600">Begin Phase A: Learn through story</p>
              </Link>
              <Link
                href="/upload"
                className="block p-4 bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 rounded hover:shadow transition"
              >
                <h4 className="font-bold text-gray-900">Upload Your Content</h4>
                <p className="text-sm text-gray-600">Add PDFs, subtitles, or transcripts to personalize lessons via RAG</p>
              </Link>
              <Link
                href="/review"
                className="block p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded hover:shadow transition"
              >
                <h4 className="font-bold text-gray-900">Review Due Items ({stats.dueReviews})</h4>
                <p className="text-sm text-gray-600">Spaced repetition for long-term retention</p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tips</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✓ Review consistently for best results</li>
              <li>✓ Don't worry about perfect pronunciation</li>
              <li>✓ Focus on understanding meaning first</li>
              <li>✓ Grammar will come naturally</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">About This App</h3>
          <p className="text-gray-700">
            AcquisitionOS is built on scientific language acquisition principles. Every lesson is designed to be 80-90% comprehensible, with grammar taught only after you experience it in context.
          </p>
        </div>
      </main>
    </div>
  );
}
