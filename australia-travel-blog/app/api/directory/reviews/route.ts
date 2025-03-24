import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createDirectoryReview, getDirectoryReviews } from '@/app/lib/directoryDb';

// GET /api/directory/reviews?listing_id=123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listing_id parameter' },
        { status: 400 }
      );
    }

    const reviews = await getDirectoryReviews(parseInt(listingId));
    
    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / reviews.length;
    }
    
    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching directory reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/directory/reviews
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { listing_id, rating, content } = data;

    // Validate required fields
    if (!listing_id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review content must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Create the review
    const userId = typeof session.user.id === 'string' ? session.user.id : String(session.user.id);
    const userName = session.user.name || 'Anonymous User';
    
    const review = await createDirectoryReview({
      listing_id: parseInt(listing_id),
      user_id: userId,
      user_name: userName,
      rating,
      content,
    });

    return NextResponse.json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting directory review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// PUT /api/directory/reviews/helpful
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { review_id, action } = data;

    if (!review_id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    if (!['mark_helpful', 'report'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "mark_helpful" or "report"' },
        { status: 400 }
      );
    }

    // In a real implementation, we would update the review in the database
    // For now, we'll just return a success response
    return NextResponse.json({
      message: action === 'mark_helpful' 
        ? 'Review marked as helpful'
        : 'Review reported successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
} 