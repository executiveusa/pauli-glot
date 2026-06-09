import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ video: null }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ video: null });
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&size=medium`,
      { headers: { Authorization: apiKey } }
    );

    if (!res.ok) {
      return NextResponse.json({ video: null });
    }

    const data = await res.json();
    const pexelsVideo = data.videos?.[0];

    if (!pexelsVideo) {
      return NextResponse.json({ video: null });
    }

    const files: Array<{ quality: string; width: number; link: string }> =
      pexelsVideo.video_files || [];

    const file =
      files.find(f => f.quality === 'hd' && f.width <= 1280) ||
      files.find(f => f.quality === 'sd') ||
      files[0];

    return NextResponse.json({
      video: {
        url: file?.link ?? null,
        thumb: pexelsVideo.image ?? null,
      },
    });
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json({ video: null });
  }
}
