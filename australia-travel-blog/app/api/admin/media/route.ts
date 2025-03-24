import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createMediaItem, listMediaItems } from '@/app/lib/mediaLib';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// GET endpoint to list media items
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || null;
    const search = searchParams.get('search') || null;
    
    // Get sorted field and direction
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const result = await listMediaItems({
      page,
      limit,
      type,
      search,
      sortBy,
      sortOrder
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing media items:', error);
    return NextResponse.json(
      { error: 'Failed to list media items', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST endpoint to upload media
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Ensure the media is being uploaded as form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Get file metadata
    const originalFilename = file.name;
    const fileSize = file.size;
    const mimeType = file.type;
    
    // Determine file type (image, video, document, etc.)
    let fileType = 'document';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
    }
    
    // Generate a unique filename
    const fileExtension = path.extname(originalFilename);
    const filename = `${uuidv4()}${fileExtension}`;
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', fileType);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Save the file
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Save to database
    const relativePath = `/uploads/${fileType}/${filename}`;
    const mediaData = {
      filename,
      original_filename: originalFilename,
      file_path: relativePath,
      file_size: fileSize,
      file_type: fileType,
      mime_type: mimeType,
      // For images, we could also determine width and height here
      alt_text: formData.get('alt_text') as string || '',
      caption: formData.get('caption') as string || ''
    };
    
    const mediaItem = await createMediaItem(mediaData);
    
    return NextResponse.json(
      { message: 'Media uploaded successfully', media: mediaItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media', message: (error as Error).message },
      { status: 500 }
    );
  }
} 