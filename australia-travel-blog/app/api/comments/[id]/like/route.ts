import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    // Check if comment exists
    const checkComment = await db.query({
      text: 'SELECT id FROM blog_comments WHERE id = $1',
      values: [commentId],
    });
    
    if (checkComment.rowCount === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Increment likes count
    const result = await db.query({
      text: `
        UPDATE blog_comments
        SET likes = likes + 1
        WHERE id = $1
        RETURNING id, likes
      `,
      values: [commentId],
    });
    
    const updatedComment = result.rows[0];
    
    return NextResponse.json({ success: true, likes: updatedComment.likes });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    );
  }
} 