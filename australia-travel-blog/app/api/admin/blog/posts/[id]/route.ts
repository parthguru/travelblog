import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getBlogPostById, 
  updateBlogPost, 
  deleteBlogPost 
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
    
    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    const post = await getBlogPostById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post', message: (error as Error).message },
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
    
    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Get post data from request body
    const postData = await request.json();
    
    // Check if post exists
    const existingPost = await getBlogPostById(postId);
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Update post
    const updatedPost = await updateBlogPost(postId, postData);
    
    return NextResponse.json({
      message: 'Blog post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post', message: (error as Error).message },
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
    
    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Check if post exists
    const existingPost = await getBlogPostById(postId);
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Delete post
    await deleteBlogPost(postId);
    
    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post', message: (error as Error).message },
      { status: 500 }
    );
  }
} 