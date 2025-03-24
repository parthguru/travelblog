import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { 
  linkBlogPostToDirectory, 
  unlinkBlogPostFromDirectory,
  getRelatedDirectoryListings,
  getRelatedBlogPosts,
  getAllBlogDirectoryLinks
} from '../../../../../lib/integrationDb';

// GET: Retrieve integration data
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // If specific type and id provided, get related items
    if (type && id) {
      const idNum = parseInt(id);
      
      if (isNaN(idNum)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
      }

      if (type === 'blogToDirec') {
        // Get directory listings related to a blog post
        const listings = await getRelatedDirectoryListings(idNum);
        return NextResponse.json({ listings });
      } else if (type === 'direcToBlog') {
        // Get blog posts related to a directory listing
        const posts = await getRelatedBlogPosts(idNum);
        return NextResponse.json({ posts });
      } else {
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
      }
    } else {
      // Get all links
      const links = await getAllBlogDirectoryLinks();
      return NextResponse.json({ links });
    }
  } catch (error) {
    console.error('Error in directory integration GET route:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve integration data' },
      { status: 500 }
    );
  }
}

// POST: Create a new link between blog post and directory listing
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { blogPostId, directoryListingId } = await request.json();
    
    // Validate inputs
    if (!blogPostId || !directoryListingId) {
      return NextResponse.json(
        { error: 'Blog post ID and directory listing ID are required' },
        { status: 400 }
      );
    }

    // Link blog post to directory listing
    await linkBlogPostToDirectory(blogPostId, directoryListingId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blog post linked to directory listing successfully' 
    });
  } catch (error) {
    console.error('Error in directory integration POST route:', error);
    return NextResponse.json(
      { error: 'Failed to link blog post to directory listing' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a link between blog post and directory listing
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const blogPostId = searchParams.get('blogPostId');
    const directoryListingId = searchParams.get('directoryListingId');
    
    // Validate inputs
    if (!blogPostId || !directoryListingId) {
      return NextResponse.json(
        { error: 'Blog post ID and directory listing ID are required' },
        { status: 400 }
      );
    }

    // Unlink blog post from directory listing
    await unlinkBlogPostFromDirectory(parseInt(blogPostId), parseInt(directoryListingId));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blog post unlinked from directory listing successfully' 
    });
  } catch (error) {
    console.error('Error in directory integration DELETE route:', error);
    return NextResponse.json(
      { error: 'Failed to unlink blog post from directory listing' },
      { status: 500 }
    );
  }
} 