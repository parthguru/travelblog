import { getDirectoryListingBySlug, updateDirectoryListing, deleteDirectoryListing } from '@/app/lib/directoryDb';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific directory listing by ID/slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id;
    const listing = await getDirectoryListingBySlug(slug);
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching directory listing:', error);
    return NextResponse.json({ error: 'Failed to fetch directory listing' }, { status: 500 });
  }
}

// Update an existing directory listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = parseInt(params.id);
    
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Validation could be added here
    if (!data.name || !data.slug || !data.category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category_id are required fields' }, 
        { status: 400 }
      );
    }
    
    const updatedListing = await updateDirectoryListing(listingId, data);
    
    if (!updatedListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating directory listing:', error);
    return NextResponse.json({ error: 'Failed to update directory listing' }, { status: 500 });
  }
}

// Delete a directory listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = parseInt(params.id);
    
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }
    
    await deleteDirectoryListing(listingId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting directory listing:', error);
    return NextResponse.json({ error: 'Failed to delete directory listing' }, { status: 500 });
  }
} 