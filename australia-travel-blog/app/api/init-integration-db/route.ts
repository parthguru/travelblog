import { NextResponse } from 'next/server';
import { initializeIntegrationDatabase } from '@/app/lib/integrationDb';

export async function GET() {
  try {
    await initializeIntegrationDatabase();
    return NextResponse.json({ success: true, message: 'Integration database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize integration database:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize integration database', error: (error as Error).message },
      { status: 500 }
    );
  }
} 