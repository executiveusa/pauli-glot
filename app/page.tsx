import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AcquisitionOS
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Learn Mexican Spanish Naturally
          </p>
          <p className="text-lg text-gray-600 mb-8">
            Through comprehensible input, storytelling, and spaced repetition
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-lg mb-2">Phase A: Story</h3>
              <p className="text-gray-700">
                Read engaging Mexican Spanish stories that are 80-90% comprehensible from context
              </p>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-bold text-lg mb-2">Phase B: Patterns</h3>
              <p className="text-gray-700">
                Learn grammar patterns only after experiencing them in context
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-lg mb-2">Phase C: Practice</h3>
              <p className="text-gray-700">
                Answer comprehension questions and check your understanding
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Grounded in Science
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">✓</span>
              <span>Krashen's Input Hypothesis & Affective Filter</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">✓</span>
              <span>Tracy Terrell's Natural Approach</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">✓</span>
              <span>Blaine Ray's TPRS (Teaching Proficiency through Reading & Storytelling)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">✓</span>
              <span>Spaced Repetition (FSRS) for long-term retention</span>
            </li>
          </ul>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <p className="text-gray-600 text-sm">
            No account needed for the MVP
          </p>
        </div>
      </div>
    </div>
  );
}
