// lib/blogPosts.js
import { pool } from './db';

async function getAllBlogPosts() {
  try {
    const result = await pool.query(`
      SELECT
        bp.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM blog_posts bp
      LEFT JOIN categories c ON bp.category_id = c.id
      WHERE bp.published = true AND (bp.status = 'published' OR 
        (bp.status = 'scheduled' AND bp.published_at <= NOW()))
      ORDER BY bp.published_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching all blog posts:', error);
    throw error;
  }
}

async function getBlogPostBySlug(slug) {
  try {
    const result = await pool.query(`
      SELECT
        bp.*,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(
          json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
          FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS tags
      FROM blog_posts bp
      LEFT JOIN categories c ON bp.category_id = c.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      LEFT JOIN tags t ON bpt.tag_id = t.id
      WHERE bp.slug = $1 
        AND bp.published = true 
        AND (bp.status = 'published' OR (bp.status = 'scheduled' AND bp.published_at <= NOW()))
      GROUP BY bp.id, c.name, c.slug
    `, [slug]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching blog post with slug "${slug}":`, error);
    throw error;
  }
}

async function getAllCategories() {
  try {
    const result = await pool.query('SELECT * FROM categories');
    return result.rows;
  } catch (error) {
    console.error('Error fetching all categories', error);
    throw error;
  }
}

async function getBlogPostsByCategoryId(categoryId) {
  try {
    const result = await pool.query(`
      SELECT * FROM blog_posts 
      WHERE category_id = $1 
        AND published = true 
        AND (status = 'published' OR (status = 'scheduled' AND published_at <= NOW()))
      ORDER BY published_at DESC
    `, [categoryId]);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching blog posts with category ID ${categoryId}:`, error);
    throw error;
  }
}

async function getTagsForBlogPost(postId) {
    try {
        const result = await pool.query(`
            SELECT t.*
            FROM tags t
            JOIN blog_post_tags bpt ON t.id = bpt.tag_id
            WHERE bpt.post_id = $1
        `, [postId]);
        return result.rows;
    } catch(error) {
        console.error(`Error fetching tags for blog post ID ${postId}:`, error);
        throw error;
    }
}

export { getAllBlogPosts, getBlogPostBySlug, getAllCategories, getBlogPostsByCategoryId, getTagsForBlogPost };
