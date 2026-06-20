'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface UploadedAsset {
  id: string;
  fileName: string;
  fileType: string;
  chunkCount: number;
  charCount: number;
  contentType: string;
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadedAsset | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      setResult(data.asset);
    } catch (err) {
      setError('Upload failed. Make sure your OpenAI API key is set.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Upload Content</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Upload Your Spanish Materials
        </h2>
        <p className="text-gray-600 mb-8">
          Upload PDFs, text files, or subtitle files. The app will extract text, embed it, and use it to personalize your lessons.
        </p>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
            dragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.srt,.vtt,.md"
            onChange={onFileChange}
            className="hidden"
          />
          {uploading ? (
            <div>
              <div className="text-4xl mb-3">⚙️</div>
              <p className="text-gray-700 font-semibold">Processing...</p>
              <p className="text-gray-500 text-sm mt-1">
                Extracting text and generating embeddings
              </p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-700 font-semibold">
                Drag and drop a file here, or click to browse
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Supported: PDF, TXT, SRT, VTT, MD (max 10 MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800 mb-3">
              ✓ Uploaded Successfully
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">File</dt>
                <dd className="font-medium">{result.fileName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Type</dt>
                <dd className="font-medium">{result.contentType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Characters extracted</dt>
                <dd className="font-medium">{result.charCount.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Chunks embedded</dt>
                <dd className="font-medium">{result.chunkCount}</dd>
              </div>
            </dl>
            <p className="mt-4 text-green-700 text-sm">
              This content will now be used to personalize your lessons. Go generate a lesson to see it in action.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/lesson/new"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition text-sm"
              >
                Generate a Lesson
              </Link>
              <button
                onClick={() => { setResult(null); setError(''); }}
                className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-50 transition text-sm"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">What to Upload</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ <strong>PDF books or articles</strong> in Spanish</li>
            <li>✓ <strong>Subtitle files (.srt/.vtt)</strong> from Spanish shows or movies</li>
            <li>✓ <strong>Transcripts</strong> from Spanish podcasts or YouTube</li>
            <li>✓ <strong>Notes or vocabulary lists</strong> you've saved</li>
            <li>✓ <strong>Conversation logs</strong> you want to revisit</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            The AI will extract and embed the content, then use it to build lessons personalized to your actual materials.
          </p>
        </div>
      </main>
    </div>
  );
}
