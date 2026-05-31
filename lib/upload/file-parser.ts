// Extract plain text from uploaded files
// Supports: PDF, SRT/VTT subtitles, plain text

import { readFileSync } from 'fs';

export interface ParsedContent {
  text: string;
  type: 'text' | 'subtitle' | 'pdf';
  segments?: SubtitleSegment[]; // for subtitle files
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<ParsedContent> {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return extractPDF(buffer);
  }

  if (ext === 'srt') {
    return extractSRT(buffer.toString('utf-8'));
  }

  if (ext === 'vtt') {
    return extractVTT(buffer.toString('utf-8'));
  }

  // Treat everything else as plain text
  return {
    text: buffer.toString('utf-8').trim(),
    type: 'text',
  };
}

async function extractPDF(buffer: Buffer): Promise<ParsedContent> {
  try {
    // Dynamically import pdf-parse (CommonJS module)
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return {
      text: data.text.replace(/\s+/g, ' ').trim(),
      type: 'pdf',
    };
  } catch (err) {
    console.error('PDF extraction failed:', err);
    throw new Error('Failed to parse PDF. Try uploading a text file instead.');
  }
}

function extractSRT(raw: string): ParsedContent {
  const segments: SubtitleSegment[] = [];
  const normalized = raw.replace(/\r\n/g, '\n');
  const blocks = normalized.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    // Find the timing line (contains " --> ")
    const timingIndex = lines.findIndex(l => l.includes('-->'));
    if (timingIndex === -1) continue;

    const timing = lines[timingIndex];
    const [startStr, endStr] = timing.split('-->').map(t => t.trim());
    const text = lines.slice(timingIndex + 1).join(' ').trim();

    if (!text) continue;

    segments.push({
      start: parseSRTTime(startStr),
      end: parseSRTTime(endStr),
      text,
    });
  }

  return {
    text: segments.map(s => s.text).join(' '),
    type: 'subtitle',
    segments,
  };
}

function extractVTT(raw: string): ParsedContent {
  const segments: SubtitleSegment[] = [];
  // Normalize line endings and strip WEBVTT header
  const normalized = raw.replace(/\r\n/g, '\n');
  const body = normalized.replace(/^WEBVTT.*?\n\n/s, '');
  const blocks = body.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const timingIndex = lines.findIndex(l => l.includes('-->'));
    if (timingIndex === -1) continue;

    const timing = lines[timingIndex];
    const [startStr, endStr] = timing.split('-->').map(t => t.trim());
    const text = lines
      .slice(timingIndex + 1)
      .join(' ')
      .replace(/<[^>]+>/g, '') // strip HTML tags in VTT
      .trim();

    if (!text) continue;

    segments.push({
      start: parseVTTTime(startStr),
      end: parseVTTTime(endStr),
      text,
    });
  }

  return {
    text: segments.map(s => s.text).join(' '),
    type: 'subtitle',
    segments,
  };
}

function parseSRTTime(t: string): number {
  // HH:MM:SS,mmm → seconds
  const [hms, ms] = t.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number(ms) / 1000;
}

function parseVTTTime(t: string): number {
  // HH:MM:SS.mmm or MM:SS.mmm → seconds
  const parts = t.split(':');
  if (parts.length === 2) {
    const [m, s] = parts;
    return Number(m) * 60 + parseFloat(s);
  }
  const [h, m, s] = parts;
  return Number(h) * 3600 + Number(m) * 60 + parseFloat(s);
}
