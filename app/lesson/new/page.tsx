'use client';

import { useState } from 'react';
import Link from 'next/link';

const defaultStructures = [
  'tener que + infinitive (have to/must)',
  'ir + a (going to)',
];

interface GeneratedLesson {
  id: string;
  title: string;
  phaseA: string;
  phaseB: string;
  phaseC: string;
  targetStructures: string[];
  difficulty: string;
  comprehensibilityScore: {
    overallScore: number;
    isComprehensible: boolean;
    reasoning: string;
  };
}

export default function NewLessonPage() {
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [error, setError] = useState('');
  const [selectedStructures, setSelectedStructures] = useState<string[]>([
    defaultStructures[0],
  ]);
  const [personalContext, setPersonalContext] = useState('');

  const handleStructureToggle = (structure: string) => {
    setSelectedStructures(prev =>
      prev.includes(structure)
        ? prev.filter(s => s !== structure)
        : [...prev, structure]
    );
  };

  const generateLesson = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lesson/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learnerLevel: 'A2',
          targetStructures: selectedStructures,
          personalizedContext: personalContext || undefined,
          userId: 'demo-user',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to generate lesson');
        return;
      }

      const data = await response.json();
      setLesson(data.story);
    } catch (err) {
      setError('An error occurred. Make sure your OpenAI API key is set.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (lesson) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <div className="flex gap-4 mb-8">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
              Level: {lesson.difficulty}
            </span>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
              Comprehensibility: {lesson.comprehensibilityScore.overallScore}%
            </span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Phase A: Story</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
              {lesson.phaseA}
            </p>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Target structures in this story:</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {lesson.targetStructures.map((structure, i) => (
                  <span
                    key={i}
                    className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded text-sm"
                  >
                    {structure}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Phase B: Pattern Breakdown
            </h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {lesson.phaseB}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Phase C: Practice</h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {lesson.phaseC}
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-gray-900 mb-2">How to Use This Lesson</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <strong>Read Phase A</strong> - Don't worry if you don't understand every word.
                The story should make sense from context.
              </li>
              <li>
                <strong>Study Phase B</strong> - Now that you've seen the patterns in action,
                read the explanation.
              </li>
              <li>
                <strong>Practice Phase C</strong> - Answer the comprehension questions.
              </li>
            </ol>
          </div>

          <div className="text-center">
            <button
              onClick={() => setLesson(null)}
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Generate Another Lesson
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Create a New Lesson</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-900 mb-4">
              Select Grammar Structures to Learn
            </label>
            <div className="space-y-3">
              {defaultStructures.map(structure => (
                <label key={structure} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStructures.includes(structure)}
                    onChange={() => handleStructureToggle(structure)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700">{structure}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-900 mb-2">
              Personalized Context (Optional)
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Tell us about your interests, work, or travel plans to make the lesson more relevant.
            </p>
            <textarea
              value={personalContext}
              onChange={e => setPersonalContext(e.target.value)}
              placeholder="E.g., I'm a software engineer interested in travel and coffee..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={generateLesson}
            disabled={loading || selectedStructures.length === 0}
            className={`w-full py-3 rounded-lg font-bold text-white transition ${
              loading || selectedStructures.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generating... This may take a moment.' : 'Generate Lesson'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">How This Works</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>
              ✓ AI generates a personalized story that naturally teaches your selected structures
            </li>
            <li>
              ✓ The story is designed to be 80-90% comprehensible from context alone
            </li>
            <li>
              ✓ Grammar explanations come AFTER you experience the patterns
            </li>
            <li>
              ✓ Comprehension questions help you verify understanding
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
