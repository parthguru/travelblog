import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getBlogTagById, 
  updateBlogTag, 
  deleteBlogTag 
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
    
    const tagId = parseInt(params.id);
    
    if (isNaN(tagId)) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
    }
    
    const tag = await getBlogTagById(tagId);
    
    if (!tag) {
      return NextResponse.json({ error: 'Blog tag not found' }, { status: 404 });
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching blog tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog tag', message: (error as Error).message },
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
    
    const tagId = parseInt(params.id);
    
    if (isNaN(tagId)) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
    }
    
    // Get tag data from request body
    const tagData = await request.json();
    
    if (!tagData.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // Check if tag exists
    const existingTag = await getBlogTagById(tagId);
    
    if (!existingTag) {
      return NextResponse.json({ error: 'Blog tag not found' }, { status: 404 });
    }
    
    // Update tag
    const updatedTag = await updateBlogTag(tagId, tagData);
    
    return NextResponse.json({
      message: 'Blog tag updated successfully',
      tag: updatedTag
    });
  } catch (error) {
    console.error('Error updating blog tag:', error);
    return NextResponse.json(
      { error: 'Failed to update blog tag', message: (error as Error).message },
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
    
    const tagId = parseInt(params.id);
    
    if (isNaN(tagId)) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
    }
    
    // Check if tag exists
    const existingTag = await getBlogTagById(tagId);
    
    if (!existingTag) {
      return NextResponse.json({ error: 'Blog tag not found' }, { status: 404 });
    }
    
    // Delete tag
    await deleteBlogTag(tagId);
    
    return NextResponse.json({ message: 'Blog tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog tag', message: (error as Error).message },
      { status: 500 }
    );
  }
} 