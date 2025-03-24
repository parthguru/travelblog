import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { initializeMediaDatabase } from '@/app/lib/mediaLib';

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Initializing media database...');
    
    const success = await initializeMediaDatabase();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Media database initialized successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to initialize media database' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error initializing media database:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
} 