import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Upload API disabled for development
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
    }

    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = fileName.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'txt', 'srt', 'vtt', 'md'];

    if (!ext || !validExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${validExts.join(', ')}` },
        { status: 400 }
      );
    }

    // Demo response for development
    return NextResponse.json({
      success: true,
      asset: {
        id: 'demo-asset-' + Date.now(),
        fileName,
        fileType: ext,
        chunkCount: 5,
        charCount: 1500,
        contentType: 'text',
      },
    });
  } catch (error) {
    console.error('[upload]', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  // Demo response for development
  return NextResponse.json({
    assets: [
      {
        id: 'demo-1',
        fileName: 'spanish-podcast.txt',
        fileType: 'txt',
        createdAt: new Date(),
        _count: { chunks: 3 },
      },
    ],
  });
}
