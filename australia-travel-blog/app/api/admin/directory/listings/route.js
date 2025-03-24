import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { 
  listDirectoryListings, 
  createDirectoryListing, 
  getDirectoryListingBySlug 
} from '@/app/lib/directoryDb';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || null;
    const category = searchParams.get('category') || null;
    const location = searchParams.get('location') || null;
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'ASC';
    const featured = searchParams.has('featured') 
      ? searchParams.get('featured') === 'true' 
      : null;
    
    const result = await listDirectoryListings({
      page,
      limit,
      search,
      categoryId: category,
      location,
      sort,
      order,
      featured
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching directory listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      name,
      description,
      location,
      address,
      latitude,
      longitude,
      website,
      phone,
      email,
      price_range,
      hours,
      images,
      category_id,
      slug,
      featured
    } = body;
    
    // Validate required fields
    if (!name || !slug || !category_id || !location) {
      return NextResponse.json({ 
        error: 'Name, slug, category, and location are required' 
      }, { status: 400 });
    }
    
    // Check if slug is already in use
    const existingListing = await getDirectoryListingBySlug(slug);
    if (existingListing) {
      return NextResponse.json({ error: 'Slug is already in use' }, { status: 400 });
    }
    
    const newListing = await createDirectoryListing({
      name,
      description,
      location,
      address,
      latitude,
      longitude,
      website,
      phone,
      email,
      price_range,
      hours,
      images,
      category_id,
      slug,
      featured: featured || false
    });
    
    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating directory listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
} 