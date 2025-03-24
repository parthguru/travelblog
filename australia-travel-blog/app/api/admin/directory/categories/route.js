import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { 
  listDirectoryCategories, 
  createDirectoryCategory, 
  getDirectoryCategoryBySlug 
} from '@/app/lib/directoryDb';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const categories = await listDirectoryCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching directory categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
    const { name, slug, description } = body;
    
    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    
    // Check if slug is already in use
    const existingCategory = await getDirectoryCategoryBySlug(slug);
    if (existingCategory) {
      return NextResponse.json({ error: 'Slug is already in use' }, { status: 400 });
    }
    
    const newCategory = await createDirectoryCategory(name, slug, description);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating directory category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
} 