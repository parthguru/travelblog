import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createId } from '@paralleldrive/cuid2';

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
    
    // Log the report in the database
    const reportId = createId();
    const timestamp = new Date();
    
    await db.query({
      text: `
        INSERT INTO comment_reports (
          id, comment_id, reported_at, status
        ) VALUES ($1, $2, $3, $4)
      `,
      values: [reportId, commentId, timestamp, 'pending'],
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Comment reported successfully' 
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    return NextResponse.json(
      { error: 'Failed to report comment' },
      { status: 500 }
    );
  }
} 