import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Initialize the SQLite database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'integration.db'),
    driver: sqlite3.Database
  });
}

// Initialize the database tables if they don't exist
export async function initializeIntegrationDatabase() {
  console.log('Initializing integration database...');
  
  const db = await openDb();
  
  // Create the blog_directory_links table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS blog_directory_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blog_post_id INTEGER NOT NULL,
      directory_listing_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(blog_post_id, directory_listing_id)
    )
  `);
  
  console.log('Integration database initialized');
  
  return db;
}

// Link a blog post to a directory listing
export async function linkBlogPostToDirectory(blogPostId, directoryListingId) {
  const db = await initializeIntegrationDatabase();
  
  try {
    await db.run(
      `INSERT INTO blog_directory_links (blog_post_id, directory_listing_id) 
       VALUES (?, ?)`,
      [blogPostId, directoryListingId]
    );
    
    return true;
  } catch (error) {
    // If the link already exists, don't throw an error
    if (error.message.includes('UNIQUE constraint failed')) {
      return true;
    }
    throw error;
  } finally {
    await db.close();
  }
}

// Unlink a blog post from a directory listing
export async function unlinkBlogPostFromDirectory(blogPostId, directoryListingId) {
  const db = await initializeIntegrationDatabase();
  
  try {
    await db.run(
      `DELETE FROM blog_directory_links 
       WHERE blog_post_id = ? AND directory_listing_id = ?`,
      [blogPostId, directoryListingId]
    );
    
    return true;
  } finally {
    await db.close();
  }
}

// Get all directory listings related to a blog post
export async function getRelatedDirectoryListings(blogPostId) {
  const db = await initializeIntegrationDatabase();
  
  try {
    // Join with directory_listings to get the listing details
    const listings = await db.all(`
      SELECT dl.* 
      FROM blog_directory_links bdl
      JOIN directory_listings dl ON bdl.directory_listing_id = dl.id
      WHERE bdl.blog_post_id = ?
    `, [blogPostId]);
    
    return { listings };
  } finally {
    await db.close();
  }
}

// Get all blog posts related to a directory listing
export async function getRelatedBlogPosts(directoryListingId) {
  const db = await initializeIntegrationDatabase();
  
  try {
    // Join with blog_posts to get the post details
    const posts = await db.all(`
      SELECT bp.* 
      FROM blog_directory_links bdl
      JOIN blog_posts bp ON bdl.blog_post_id = bp.id
      WHERE bdl.directory_listing_id = ?
    `, [directoryListingId]);
    
    return { posts };
  } finally {
    await db.close();
  }
}

// Get all blog-directory links with related information
export async function getAllBlogDirectoryLinks() {
  const db = await initializeIntegrationDatabase();
  try {
    const links = await db.all(`
      SELECT 
        bl.id, 
        bl.blog_post_id, 
        bl.directory_listing_id, 
        bp.title as blog_post_title,
        dl.name as directory_listing_name,
        bl.created_at
      FROM blog_directory_links bl
      JOIN blog_posts bp ON bl.blog_post_id = bp.id
      JOIN directory_listings dl ON bl.directory_listing_id = dl.id
      ORDER BY bl.created_at DESC
    `);
    return links;
  } catch (error) {
    console.error('Error getting all blog-directory links:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Initialize the integration database on module import
initializeIntegrationDatabase().catch(console.error); 