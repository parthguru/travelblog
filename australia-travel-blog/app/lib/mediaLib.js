import { pool } from './db';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Initialize the media database tables
export async function initializeMediaDatabase() {
  try {
    // Create media directory if it doesn't exist
    const mediaDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    // Drop existing table if it exists
    await pool.query(`
      DROP TABLE IF EXISTS media_items CASCADE;
    `);

    // Create media_items table
    await pool.query(`
      CREATE TABLE media_items (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        caption TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    return true;
  } catch (error) {
    console.error('Error initializing media database:', error);
    return false;
  }
}

// List all media items with pagination
export async function listMediaItems({
  page = 1,
  limit = 20,
  type = null,
  search = null,
  sortBy = 'created_at',
  sortOrder = 'DESC'
} = {}) {
  try {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, filename, original_filename, file_path, file_size, file_type,
             mime_type, width, height, alt_text, caption, created_at, updated_at
      FROM media_items
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (type) {
      queryParams.push(type);
      query += ` AND file_type = $${queryParams.length}`;
    }
    
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (original_filename ILIKE $${queryParams.length} OR alt_text ILIKE $${queryParams.length} OR caption ILIKE $${queryParams.length})`;
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM media_items WHERE 1=1
    `;
    
    const countParams = [];
    
    if (type) {
      countParams.push(type);
      countQuery += ` AND file_type = $${countParams.length}`;
    }
    
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (original_filename ILIKE $${countParams.length} OR alt_text ILIKE $${countParams.length} OR caption ILIKE $${countParams.length})`;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    return {
      media: result.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error listing media items:', error);
    throw error;
  }
}

// Get a single media item by ID
export async function getMediaItemById(id) {
  try {
    const result = await pool.query(
      `SELECT id, filename, original_filename, file_path, file_size, file_type,
              mime_type, width, height, alt_text, caption, created_at, updated_at
       FROM media_items 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting media item:', error);
    throw error;
  }
}

// Create a new media item
export async function createMediaItem(mediaData) {
  try {
    const {
      filename,
      original_filename,
      file_path,
      file_size,
      file_type,
      mime_type,
      width,
      height,
      alt_text,
      caption
    } = mediaData;
    
    const result = await pool.query(
      `INSERT INTO media_items (
        filename, original_filename, file_path, file_size, file_type,
        mime_type, width, height, alt_text, caption
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, filename, original_filename, file_path, file_size, file_type,
                mime_type, width, height, alt_text, caption, created_at, updated_at`,
      [
        filename,
        original_filename,
        file_path,
        file_size,
        file_type,
        mime_type,
        width || null,
        height || null,
        alt_text || null,
        caption || null
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating media item:', error);
    throw error;
  }
}

// Update a media item
export async function updateMediaItem(id, mediaData) {
  try {
    const {
      alt_text,
      caption
    } = mediaData;
    
    const result = await pool.query(
      `UPDATE media_items
       SET alt_text = $1,
           caption = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, filename, original_filename, file_path, file_size, file_type,
                 mime_type, width, height, alt_text, caption, created_at, updated_at`,
      [
        alt_text || null,
        caption || null,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating media item:', error);
    throw error;
  }
}

// Delete a media item
export async function deleteMediaItem(id) {
  try {
    // First get the file path
    const fileResult = await pool.query(
      'SELECT file_path FROM media_items WHERE id = $1',
      [id]
    );
    
    if (fileResult.rows.length === 0) {
      return false;
    }
    
    const filePath = path.join(process.cwd(), 'public', fileResult.rows[0].file_path);
    
    // Delete from database
    const result = await pool.query(
      'DELETE FROM media_items WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    // Delete the file from disk
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting file from disk:', fileError);
      // Continue even if file deletion fails
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting media item:', error);
    throw error;
  }
} 