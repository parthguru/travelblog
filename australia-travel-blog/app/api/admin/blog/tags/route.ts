import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  listBlogTags, 
  createBlogTag 
} from '@/app/lib/blogDb';

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tags = await listBlogTags();
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog tags', message: (error as Error).message },
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
    
    // Get tag data from request body
    const tagData = await request.json();
    
    if (!tagData.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    const newTag = await createBlogTag(tagData);
    
    return NextResponse.json(
      { message: 'Blog tag created successfully', tag: newTag },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog tag:', error);
    return NextResponse.json(
      { error: 'Failed to create blog tag', message: (error as Error).message },
      { status: 500 }
    );
  }
} 