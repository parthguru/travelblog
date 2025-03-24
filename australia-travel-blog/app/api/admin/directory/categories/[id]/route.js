import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { 
  updateDirectoryCategory, 
  deleteDirectoryCategory,
  getDirectoryCategoryBySlug
} from '@/app/lib/directoryDb';

export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, slug, description } = body;
    
    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    
    // Check if slug is already in use by another category
    const existingCategory = await getDirectoryCategoryBySlug(slug);
    if (existingCategory && existingCategory.id !== id) {
      return NextResponse.json({ error: 'Slug is already in use' }, { status: 400 });
    }
    
    const updatedCategory = await updateDirectoryCategory(id, name, slug, description);
    
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating directory category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    const result = await deleteDirectoryCategory(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting directory category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 