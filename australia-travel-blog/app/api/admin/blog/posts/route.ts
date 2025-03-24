import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  listBlogPosts, 
  createBlogPost, 
  BlogPostFilters 
} from '@/app/lib/blogDb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
    const tagId = searchParams.get('tagId') ? parseInt(searchParams.get('tagId')!) : undefined;
    const published = searchParams.get('published') 
      ? searchParams.get('published') === 'true'
      : undefined;
    const status = searchParams.get('status') || undefined;
    
    const filters: BlogPostFilters = {
      search,
      categoryId,
      tagId,
      published,
      status: status as 'draft' | 'published' | undefined
    };
    
    // Get sorted field and direction
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const { posts, total } = await listBlogPosts({
      page,
      limit,
      filters,
      sortBy,
      sortOrder
    });
    
    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error('Error handling blog posts request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts', message: (error as Error).message },
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
    
    // Get post data from request body
    const postData = await request.json();
    
    // Set author id from session
    postData.author_id = session.user.id;
    
    const newPost = await createBlogPost(postData);
    
    return NextResponse.json(
      { message: 'Blog post created successfully', post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post', message: (error as Error).message },
      { status: 500 }
    );
  }
} 