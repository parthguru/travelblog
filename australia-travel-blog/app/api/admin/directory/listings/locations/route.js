import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { countDirectoryListingsByLocation } from '@/app/lib/directoryDb';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') || null;
    
    const locations = await countDirectoryListingsByLocation(categoryId);
    
    // Extract just the location names
    const locationNames = locations.map(location => location.location);
    
    return NextResponse.json(locationNames);
  } catch (error) {
    console.error('Error fetching directory locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
} 