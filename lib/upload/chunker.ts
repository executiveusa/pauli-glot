// Split text into chunks suitable for embedding
// Target: ~400 tokens per chunk (~300 words), with 50-word overlap

export interface TextChunk {
  content: string;
  index: number;
}

const TARGET_WORDS = 300;
const OVERLAP_WORDS = 50;

export function chunkText(text: string): TextChunk[] {
  if (!text || text.trim().length === 0) return [];

  // Split on sentence boundaries first
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?¿¡])\s+/);

  const chunks: TextChunk[] = [];
  let current: string[] = [];
  let wordCount = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const words = sentence.split(' ').filter(Boolean);

    // If adding this sentence would exceed target, flush current chunk
    if (wordCount + words.length > TARGET_WORDS && current.length > 0) {
      chunks.push({
        content: current.join(' ').trim(),
        index: chunkIndex++,
      });

      // Keep overlap: last OVERLAP_WORDS words from the flushed chunk
      const allWords = current.join(' ').split(' ');
      const overlap = allWords.slice(-OVERLAP_WORDS);
      current = overlap;
      wordCount = overlap.length;
    }

    current.push(sentence);
    wordCount += words.length;
  }

  // Flush remaining
  if (current.length > 0) {
    chunks.push({
      content: current.join(' ').trim(),
      index: chunkIndex,
    });
  }

  return chunks;
}

export function chunkSubtitleSegments(
  segments: Array<{ start: number; end: number; text: string }>,
  windowSeconds = 60,
): TextChunk[] {
  // Group subtitle segments into ~60-second windows
  const chunks: TextChunk[] = [];
  let current: typeof segments = [];
  let windowStart = 0;
  let chunkIndex = 0;

  for (const seg of segments) {
    if (
      current.length > 0 &&
      seg.start - windowStart > windowSeconds
    ) {
      chunks.push({
        content: current.map(s => s.text).join(' ').trim(),
        index: chunkIndex++,
      });
      current = [];
      windowStart = seg.start;
    }

    if (current.length === 0) windowStart = seg.start;
    current.push(seg);
  }

  if (current.length > 0) {
    chunks.push({
      content: current.map(s => s.text).join(' ').trim(),
      index: chunkIndex,
    });
  }

  return chunks;
}
