import { NextResponse } from 'next/server';

// Health check — database disabled for development
export async function GET() {
  return NextResponse.json({ status: 'ok', db: 'disabled (dev mode)' });
}
