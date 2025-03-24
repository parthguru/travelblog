import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { 
  updateDirectoryListing, 
  deleteDirectoryListing, 
  getDirectoryListingBySlug 
} from '@/app/lib/directoryDb';
import { pool } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }
    
    // Query the database directly for the specific listing
    const result = await pool.query(
      `SELECT 
        l.*,
        c.name as category_name,
        c.slug as category_slug
       FROM directory_listings l
       JOIN directory_categories c ON l.category_id = c.id
       WHERE l.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    const listing = result.rows[0];
    
    // Parse JSON fields
    if (listing.hours && typeof listing.hours === 'string') {
      try {
        listing.hours = JSON.parse(listing.hours);
      } catch (e) {
        listing.hours = {};
      }
    }
    
    if (listing.images && typeof listing.images === 'string') {
      try {
        listing.images = JSON.parse(listing.images);
      } catch (e) {
        listing.images = [];
      }
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching directory listing:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
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
    
    // Check if slug is already in use by another listing
    const existingListing = await getDirectoryListingBySlug(slug);
    if (existingListing && existingListing.id !== id) {
      return NextResponse.json({ error: 'Slug is already in use' }, { status: 400 });
    }
    
    const updatedListing = await updateDirectoryListing(id, {
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
    
    if (!updatedListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating directory listing:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }
    
    const result = await deleteDirectoryListing(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting directory listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
} 