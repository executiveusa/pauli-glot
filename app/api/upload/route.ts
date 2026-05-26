import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { extractText } from '@/lib/upload/file-parser';
import { chunkText, chunkSubtitleSegments } from '@/lib/upload/chunker';
import { embedChunks } from '@/lib/upload/embedder';

export const config = {
  api: { bodyParser: false },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/vtt',
  'application/octet-stream', // .srt files often come as this
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || 'demo-user';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds 10 MB limit' },
        { status: 400 },
      );
    }

    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'txt', 'srt', 'vtt', 'md'];

    if (!ext || !validExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${validExts.join(', ')}` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from the file
    const parsed = await extractText(buffer, file.type, fileName);

    if (!parsed.text || parsed.text.length < 10) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file' },
        { status: 422 },
      );
    }

    // Create the asset record first
    const asset = await prisma.uploadedAsset.create({
      data: {
        userId,
        fileName,
        fileType: ext,
        extractedText: parsed.text.slice(0, 10000), // cap stored raw text
      },
    });

    // Chunk the content
    const rawChunks =
      parsed.type === 'subtitle' && parsed.segments
        ? chunkSubtitleSegments(parsed.segments)
        : chunkText(parsed.text);

    if (rawChunks.length === 0) {
      await prisma.uploadedAsset.delete({ where: { id: asset.id } });
      return NextResponse.json(
        { error: 'File produced no usable text chunks' },
        { status: 422 },
      );
    }

    // Embed all chunks (may take a few seconds for large files)
    const embeddings = await embedChunks(rawChunks.map(c => c.content));

    // Persist all chunks
    await prisma.assetChunk.createMany({
      data: rawChunks.map((chunk, i) => ({
        assetId: asset.id,
        chunkIndex: chunk.index,
        content: chunk.content,
        embedding: JSON.stringify(embeddings[i]),
        difficulty: 'A2', // default; could run classifier here
      })),
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        fileName,
        fileType: ext,
        chunkCount: rawChunks.length,
        charCount: parsed.text.length,
        contentType: parsed.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo-user';

  const assets = await prisma.uploadedAsset.findMany({
    where: { userId },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ assets });
}
