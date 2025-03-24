import { listDirectoryListings, createDirectoryListing, initializeDatabase } from '@/app/lib/directoryDb';
import { NextRequest, NextResponse } from 'next/server';

let databaseInitialized = false;

export async function GET(request: NextRequest) {
  if (!databaseInitialized) {
    try {
      await initializeDatabase();
      databaseInitialized = true;
      console.log('Database initialized');
    } catch (dbInitError) {
      console.error('Database initialization error:', dbInitError);
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
    }
  }

  try {
    // Parse query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order')?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const category = searchParams.get('category') || null;
    const location = searchParams.get('location') || null;
    const featured = searchParams.has('featured') 
      ? searchParams.get('featured') === 'true' 
      : null;
    const search = searchParams.get('search') || null;

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['name', 'location', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sort)) {
      return NextResponse.json(
        { error: `Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}` }, 
        { status: 400 }
      );
    }

    const result = await listDirectoryListings({
      limit,
      offset,
      sort,
      order,
      category,
      location,
      featured,
      search
    });

    // Format the response with pagination metadata
    return NextResponse.json({
      data: result.listings,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        nextOffset: result.offset + result.limit < result.total 
          ? result.offset + result.limit 
          : null,
        previousOffset: result.offset > 0 
          ? Math.max(0, result.offset - result.limit) 
          : null,
      }
    });
  } catch (error) {
    console.error('Error fetching directory listings:', error);
    return NextResponse.json({ error: 'Failed to fetch directory listings' }, { status: 500 });
  }
}

// Create a new directory listing
export async function POST(request: NextRequest) {
  if (!databaseInitialized) {
    try {
      await initializeDatabase();
      databaseInitialized = true;
      console.log('Database initialized');
    } catch (dbInitError) {
      console.error('Database initialization error:', dbInitError);
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
    }
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.slug || !data.category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category_id are required fields' }, 
        { status: 400 }
      );
    }
    
    // Check for slug format - only allow lowercase alphanumeric and hyphens
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(data.slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, 
        { status: 400 }
      );
    }
    
    // Create the listing
    const newListing = await createDirectoryListing(data);
    
    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating directory listing:', error);
    // Check for duplicate slug error
    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
      return NextResponse.json(
        { error: 'A listing with this slug already exists' }, 
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create directory listing' }, { status: 500 });
  }
}
