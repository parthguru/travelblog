import { 
  listDirectoryCategories, 
  createDirectoryCategory, 
  initializeDatabase 
} from '@/app/lib/directoryDb';
import { NextRequest, NextResponse } from 'next/server';

let databaseInitialized = false;

export async function GET() {
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
    const categories = await listDirectoryCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching directory categories:', error);
    return NextResponse.json({ error: 'Failed to fetch directory categories' }, { status: 500 });
  }
}

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
    
    // Create the category
    const newCategory = await createDirectoryCategory(data.name, data.slug, data.description);
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating directory category:', error);
    // Check for duplicate slug error
    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' }, 
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create directory category' }, { status: 500 });
  }
} 