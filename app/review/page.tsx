'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface DueItem {
  id: string;
  itemType: string;
  content: string;
  answer?: string;
  sourceStory?: string;
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Video Player ───────────────────────────────────────────────────────────────

function VideoPlayer({ query, itemId }: { query: string; itemId: string }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    setLoading(true);
    setVideoUrl(null);

    fetch(`/api/video/search?query=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setVideoUrl(data.video?.url ?? null);
      })
      .catch(() => {
        if (!cancelled) setVideoUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [itemId, query]);

  const replay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  if (loading) {
    return (
      <div
        className="w-full rounded-2xl overflow-hidden bg-gray-200 animate-pulse mb-6"
        style={{ aspectRatio: '16/9' }}
      />
    );
  }

  if (!videoUrl) return null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-black mb-6 group"
      style={{ aspectRatio: '16/9' }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      {/* Replay button — visible on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={replay}
          aria-label="Replay video"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition"
        >
          {/* Circular arrow icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Chat Panel ─────────────────────────────────────────────────────────────────

function ChatPanel({
  isOpen,
  onClose,
  currentItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentItem: DueItem | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset conversation when the reviewed item changes
  useEffect(() => {
    setMessages([]);
  }, [currentItem?.id]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || !currentItem || sending) return;
    setInput('');
    setSending(true);

    const next: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(next);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          itemContext: currentItem,
          history: messages,
        }),
      });
      const data = await res.json();
      setMessages([...next, { role: 'assistant', content: data.reply ?? 'Lo siento, algo salió mal.' }]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Lo siento, there was an error. Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = ['What does this mean?', 'Give me an example', 'Cultural context?'];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Slide-up panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '65vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow">
              P
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">Pablo</p>
              <p className="text-xs text-gray-400">Your Spanish tutor · always here</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current item context chip */}
        {currentItem && (
          <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-100 shrink-0">
            <p className="text-xs text-blue-700 truncate">
              <span className="font-semibold">Context:</span>{' '}
              {currentItem.answer
                ? `"${currentItem.answer}" — ${currentItem.content.slice(0, 60)}`
                : currentItem.content.slice(0, 80)}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-4">
                ¡Hola! Ask me anything about this word or phrase.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-3 py-1.5 rounded-full transition border border-transparent hover:border-blue-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold mr-2 mt-0.5 shrink-0">
                  P
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                P
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Pablo anything…"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ── Derive video search keyword from item ──────────────────────────────────────

function getVideoQuery(item: DueItem): string {
  // Prefer short answer (the target word/phrase)
  if (item.answer && item.answer.split(' ').length <= 4) {
    return item.answer;
  }
  // Fall back to first few words of content
  return item.content.split(' ').slice(0, 3).join(' ');
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReviewData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const userId = 'demo-user';

  useEffect(() => {
    async function fetchDueItems() {
      try {
        const response = await fetch(`/api/review/due?userId=${userId}&limit=20`);
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
        body: JSON.stringify({ srsItemId: item.id, userId, rating, responseTime: 5000 }),
      });
      if (!response.ok) throw new Error('Failed to grade review');
      const result = await response.json();
      setFeedback({ text: result.feedback, nextReviewAt: result.nextReviewAt });

      setTimeout(() => {
        if (currentIndex < data.dueItems.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setFeedback(null);
          setChatOpen(false);
        } else {
          setFeedback({ text: "Great job! You've completed all due reviews for now." });
        }
      }, 2000);
    } catch {
      setFeedback({ text: 'Error submitting review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <p className="text-gray-600">Loading due items…</p>
        </main>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!data || data.dueItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h2 className="font-bold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-700 mb-4">
              You have no items due for review right now. Great job keeping up with your studies!
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
  const progressPct = ((currentIndex + 1) / data.dueItems.length) * 100;

  // ── Main review UI ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-base font-bold text-gray-900">Spaced Repetition Review</h1>
          {/* "Ask Pablo" toggle */}
          <button
            onClick={() => setChatOpen(v => !v)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask Pablo
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-28">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">{progress}</span>
            <span className="text-xs text-gray-400">
              Today: {data.schedule.today} · Tomorrow: {data.schedule.tomorrow} · Week: {data.schedule.thisWeek}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Video context */}
        <VideoPlayer
          key={currentItem.id}
          query={getVideoQuery(currentItem)}
          itemId={currentItem.id}
        />

        {/* Word / item card */}
        <div className="bg-white rounded-2xl shadow-md p-7 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
              {currentItem.itemType.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-400">
              Difficulty {currentItem.difficulty.toFixed(1)} / 5
            </span>
          </div>

          <p className="text-xl font-semibold text-gray-900 leading-relaxed">
            {currentItem.content}
          </p>

          {currentItem.answer && (
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">Answer:</span> {currentItem.answer}
            </p>
          )}
        </div>

        {/* Feedback or rating */}
        {feedback ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-xl">
            <p className="text-gray-800 font-semibold">{feedback.text}</p>
            {feedback.nextReviewAt && (
              <p className="text-sm text-gray-500 mt-1">
                Next review: {new Date(feedback.nextReviewAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-600 text-center text-sm mb-5">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-3">
              {(
                [
                  { rating: 1, label: 'Forgot', color: 'red' },
                  { rating: 2, label: 'Difficult', color: 'yellow' },
                  { rating: 3, label: 'Good', color: 'blue' },
                  { rating: 4, label: 'Easy', color: 'green' },
                ] as const
              ).map(({ rating, label, color }) => (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  disabled={submitting}
                  className={`py-4 font-bold rounded-xl disabled:opacity-50 transition text-sm
                    ${color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                    ${color === 'yellow' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                    ${color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                    ${color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                  `}
                >
                  {rating}
                  <br />
                  <span className="text-xs font-normal">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating "Ask Pablo" button (visible when chat is closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-semibold">Ask Pablo</span>
        </button>
      )}

      {/* Chat panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentItem={currentItem}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← Dashboard
        </Link>
        <h1 className="text-base font-bold text-gray-900">Spaced Repetition Review</h1>
        <div />
      </div>
    </header>
  );
}
