import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';

// Validation schema for creating a comment
const commentSchema = z.object({
  post_id: z.string().min(1, "Post ID is required"),
  user_name: z.string().min(1, "Name is required"),
  user_email: z.string().email("Valid email is required"),
  content: z.string().min(1, "Comment content is required"),
  parent_id: z.string().optional(),
});

// GET handler - fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // First get all top-level comments for the post
    const topLevelComments = await db.query({
      text: `
        SELECT id, post_id, user_name, content, created_at, likes 
        FROM blog_comments
        WHERE post_id = $1 AND parent_id IS NULL
        ORDER BY created_at DESC
      `,
      values: [postId],
    });

    // Now get all replies
    const replies = await db.query({
      text: `
        SELECT id, post_id, parent_id, user_name, content, created_at, likes 
        FROM blog_comments
        WHERE post_id = $1 AND parent_id IS NOT NULL
        ORDER BY created_at ASC
      `,
      values: [postId],
    });

    // Organize replies under their parent comments
    const commentsWithReplies = topLevelComments.rows.map(comment => {
      const commentReplies = replies.rows.filter(
        reply => reply.parent_id === comment.id
      );
      
      return {
        ...comment,
        replies: commentReplies.length > 0 ? commentReplies : undefined
      };
    });

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST handler - create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = commentSchema.parse(body);
    
    // Generate a unique ID for the comment
    const id = createId();
    const timestamp = new Date();
    
    // Insert the comment into the database
    const result = await db.query({
      text: `
        INSERT INTO blog_comments (
          id, post_id, parent_id, user_name, user_email, content, created_at, likes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, post_id, parent_id, user_name, content, created_at, likes
      `,
      values: [
        id,
        validatedData.post_id,
        validatedData.parent_id || null,
        validatedData.user_name,
        validatedData.user_email,
        validatedData.content,
        timestamp,
        0 // Initial likes count
      ],
    });
    
    const newComment = result.rows[0];
    
    return NextResponse.json(
      { success: true, comment: newComment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 