import { NextResponse } from 'next/server';
import { initializeBlogDatabase } from '@/app/lib/blogDb';

export async function GET() {
  try {
    await initializeBlogDatabase();
    return NextResponse.json({ success: true, message: 'Blog database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize blog database:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize blog database', error: (error as Error).message },
      { status: 500 }
    );
  }
} 