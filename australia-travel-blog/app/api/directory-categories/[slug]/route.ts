import { 
  getDirectoryCategoryBySlug, 
  updateDirectoryCategory, 
  deleteDirectoryCategory,
  listDirectoryListingsByCategorySlug
} from '@/app/lib/directoryDb';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific directory category by slug and optionally its listings
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const category = await getDirectoryCategoryBySlug(slug);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // Check if listings should be included
    const includeListings = request.nextUrl.searchParams.get('include_listings') === 'true';
    
    if (includeListings) {
      const listings = await listDirectoryListingsByCategorySlug(slug);
      return NextResponse.json({
        ...category,
        listings: listings.listings
      });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching directory category:', error);
    return NextResponse.json({ error: 'Failed to fetch directory category' }, { status: 500 });
  }
}

// Update an existing directory category
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const category = await getDirectoryCategoryBySlug(slug);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required fields' }, 
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
    
    const updatedCategory = await updateDirectoryCategory(
      category.id,
      data.name,
      data.slug,
      data.description
    );
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating directory category:', error);
    // Check for duplicate slug error
    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' }, 
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to update directory category' }, { status: 500 });
  }
}

// Delete a directory category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const category = await getDirectoryCategoryBySlug(slug);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    await deleteDirectoryCategory(category.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting directory category:', error);
    
    // Check if there's a foreign key constraint error
    if (error.message && error.message.includes('violates foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete category because it contains listings. Remove all listings first.' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to delete directory category' }, { status: 500 });
  }
} 