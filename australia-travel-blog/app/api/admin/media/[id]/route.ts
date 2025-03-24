import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMediaItemById, updateMediaItem, deleteMediaItem } from '@/app/lib/mediaLib';

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
    
    const mediaId = parseInt(params.id);
    
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    
    const mediaItem = await getMediaItemById(mediaId);
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Error fetching media item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media item', message: (error as Error).message },
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
    
    const mediaId = parseInt(params.id);
    
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    
    // Get media data from request body
    const mediaData = await request.json();
    
    // Check if media exists
    const existingMedia = await getMediaItemById(mediaId);
    
    if (!existingMedia) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    // Update media
    const updatedMedia = await updateMediaItem(mediaId, mediaData);
    
    return NextResponse.json({
      message: 'Media item updated successfully',
      media: updatedMedia
    });
  } catch (error) {
    console.error('Error updating media item:', error);
    return NextResponse.json(
      { error: 'Failed to update media item', message: (error as Error).message },
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
    
    const mediaId = parseInt(params.id);
    
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    
    // Check if media exists and delete it
    const deleted = await deleteMediaItem(mediaId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Media item deleted successfully' });
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json(
      { error: 'Failed to delete media item', message: (error as Error).message },
      { status: 500 }
    );
  }
} 