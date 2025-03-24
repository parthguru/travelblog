import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  listBlogCategories, 
  createBlogCategory 
} from '@/app/lib/blogDb';

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const categories = await listBlogCategories();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get category data from request body
    const categoryData = await request.json();
    
    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    const newCategory = await createBlogCategory(categoryData);
    
    return NextResponse.json(
      { message: 'Blog category created successfully', category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: 'Failed to create blog category', message: (error as Error).message },
      { status: 500 }
    );
  }
} 