import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { extractText } from '@/lib/upload/file-parser';
import { chunkText, chunkSubtitleSegments } from '@/lib/upload/chunker';
import { embedChunks } from '@/lib/upload/embedder';
import { getOrCreateUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`upload:${user.id}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached. Max 5 uploads per hour.' },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
    }

    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_'); // sanitize filename
    const ext = fileName.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'txt', 'srt', 'vtt', 'md'];

    if (!ext || !validExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${validExts.join(', ')}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await extractText(buffer, file.type, fileName);

    if (!parsed.text || parsed.text.length < 10) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file' },
        { status: 422 }
      );
    }

    const asset = await prisma.uploadedAsset.create({
      data: {
        userId: user.id,
        fileName,
        fileType: ext,
        extractedText: parsed.text.slice(0, 10000),
      },
    });

    const rawChunks =
      parsed.type === 'subtitle' && parsed.segments
        ? chunkSubtitleSegments(parsed.segments)
        : chunkText(parsed.text);

    if (rawChunks.length === 0) {
      await prisma.uploadedAsset.delete({ where: { id: asset.id } });
      return NextResponse.json({ error: 'File produced no usable text chunks' }, { status: 422 });
    }

    const embeddings = await embedChunks(rawChunks.map(c => c.content));

    await prisma.assetChunk.createMany({
      data: rawChunks.map((chunk, i) => ({
        assetId: asset.id,
        chunkIndex: chunk.index,
        content: chunk.content,
        embedding: JSON.stringify(embeddings[i]),
        difficulty: 'A2',
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
    console.error('[upload]', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const assets = await prisma.uploadedAsset.findMany({
    where: { userId: user.id },
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
