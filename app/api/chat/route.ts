import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Chat API disabled for development
  // TODO: Re-enable when OPENAI_API_KEY is configured
  return NextResponse.json(
    { reply: 'Chat feature is disabled during development. Please configure OpenAI API key to enable.' },
    { status: 200 }
  );
}
