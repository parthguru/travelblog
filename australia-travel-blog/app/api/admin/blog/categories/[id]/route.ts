import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getBlogCategoryById, 
  updateBlogCategory, 
  deleteBlogCategory 
} from '@/app/lib/blogDb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    const category = await getBlogCategoryById(categoryId);
    
    if (!category) {
      return NextResponse.json({ error: 'Blog category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching blog category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog category', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    // Get category data from request body
    const categoryData = await request.json();
    
    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const existingCategory = await getBlogCategoryById(categoryId);
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Blog category not found' }, { status: 404 });
    }
    
    // Update category
    const updatedCategory = await updateBlogCategory(categoryId, categoryData);
    
    return NextResponse.json({
      message: 'Blog category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating blog category:', error);
    return NextResponse.json(
      { error: 'Failed to update blog category', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    // Check if category exists
    const existingCategory = await getBlogCategoryById(categoryId);
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Blog category not found' }, { status: 404 });
    }
    
    // Delete category
    await deleteBlogCategory(categoryId);
    
    return NextResponse.json({ message: 'Blog category deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog category', message: (error as Error).message },
      { status: 500 }
    );
  }
} 