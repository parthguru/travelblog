const { pool } = require('./db');

// Define interfaces
/**
 * @typedef {Object} BlogPostFilters
 * @property {string} [search] - Search term for title and content
 * @property {number} [categoryId] - Filter by category ID
 * @property {number[]} [tagIds] - Filter by tag IDs
 * @property {string} [status] - Filter by status (draft, published)
 * @property {string} [sortBy] - Sort field (created_at, title, etc.)
 * @property {string} [sortOrder] - Sort order (asc, desc)
 * @property {number} [limit] - Number of posts to return
 * @property {number} [offset] - Offset for pagination
 */

/**
 * List blog posts with optional filtering, sorting, and pagination
 * @param {BlogPostFilters} filters 
 */
async function listBlogPosts(filters = {}) {
  const {
    search,
    categoryId,
    tagIds,
    status = 'published',
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 10,
    offset = 0
  } = filters;

  // Start building the query
  let query = `
    SELECT bp.*, 
           u.name as author_name,
           c.name as category_name,
           c.slug as category_slug,
           ARRAY_AGG(DISTINCT t.name) as tag_names,
           ARRAY_AGG(DISTINCT t.slug) as tag_slugs
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    LEFT JOIN blog_categories c ON bp.category_id = c.id
    LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
    LEFT JOIN blog_tags t ON bpt.tag_id = t.id
  `;

  const whereConditions = [];
  const params = [];

  // Add where conditions based on filters
  if (search) {
    whereConditions.push("(bp.title ILIKE $1 OR bp.content ILIKE $1)");
    params.push(`%${search}%`);
  }

  if (categoryId) {
    whereConditions.push(`bp.category_id = $${params.length + 1}`);
    params.push(categoryId);
  }

  if (status) {
    whereConditions.push(`bp.status = $${params.length + 1}`);
    params.push(status);
  }

  // Add WHERE clause if there are conditions
  if (whereConditions.length > 0) {
    query += " WHERE " + whereConditions.join(" AND ");
  }

  // Add GROUP BY
  query += " GROUP BY bp.id, u.name, c.name, c.slug";

  // Add tag filtering as a HAVING clause if needed
  if (tagIds && tagIds.length > 0) {
    const tagConditions = tagIds.map((_, idx) => `$${params.length + idx + 1}`);
    query += ` HAVING ARRAY_AGG(bpt.tag_id) && ARRAY[${tagConditions.join(', ')}]`;
    params.push(...tagIds);
  }

  // Add ORDER BY
  query += ` ORDER BY bp.${sortBy} ${sortOrder}`;

  // Add LIMIT and OFFSET
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  // Execute the query
  const result = await pool.query(query, params);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(DISTINCT bp.id) 
    FROM blog_posts bp
  `;

  if (categoryId) {
    countQuery += " WHERE bp.category_id = $1";
  }

  const countResult = await pool.query(countQuery, categoryId ? [categoryId] : []);
  const totalCount = parseInt(countResult.rows[0].count);

  return {
    posts: result.rows,
    totalCount
  };
}

/**
 * Get a blog post by ID
 * @param {number} id 
 */
async function getBlogPostById(id) {
  const result = await pool.query(`
    SELECT bp.*, 
           u.name as author_name,
           c.name as category_name,
           c.slug as category_slug
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    LEFT JOIN blog_categories c ON bp.category_id = c.id
    WHERE bp.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const post = result.rows[0];

  // Get tags for the post
  const tagsResult = await pool.query(`
    SELECT t.id, t.name, t.slug
    FROM blog_tags t
    JOIN blog_post_tags bpt ON t.id = bpt.tag_id
    WHERE bpt.post_id = $1
  `, [id]);

  post.tags = tagsResult.rows;

  return post;
}

/**
 * Create a new blog post
 * @param {Object} postData 
 */
async function createBlogPost(postData) {
  const {
    title,
    slug,
    content,
    excerpt,
    featured_image,
    author_id,
    category_id,
    status = 'draft',
    meta_title,
    meta_description,
    tags = []
  } = postData;

  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert the blog post
    const postResult = await client.query(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, featured_image, 
        author_id, category_id, status, meta_title, meta_description
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title, slug, content, excerpt, featured_image,
      author_id, category_id, status, meta_title, meta_description
    ]);

    const post = postResult.rows[0];

    // Add tags if present
    if (tags.length > 0) {
      for (const tagId of tags) {
        await client.query(
          'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)',
          [post.id, tagId]
        );
      }
    }

    await client.query('COMMIT');
    return post;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update a blog post
 * @param {number} id 
 * @param {Object} postData 
 */
async function updateBlogPost(id, postData) {
  const {
    title,
    slug,
    content,
    excerpt,
    featured_image,
    category_id,
    status,
    meta_title,
    meta_description,
    tags = []
  } = postData;

  // Build the query dynamically based on provided fields
  const updateFields = [];
  const values = [];
  let paramCounter = 1;

  if (title !== undefined) {
    updateFields.push(`title = $${paramCounter++}`);
    values.push(title);
  }

  if (slug !== undefined) {
    updateFields.push(`slug = $${paramCounter++}`);
    values.push(slug);
  }

  if (content !== undefined) {
    updateFields.push(`content = $${paramCounter++}`);
    values.push(content);
  }

  if (excerpt !== undefined) {
    updateFields.push(`excerpt = $${paramCounter++}`);
    values.push(excerpt);
  }

  if (featured_image !== undefined) {
    updateFields.push(`featured_image = $${paramCounter++}`);
    values.push(featured_image);
  }

  if (category_id !== undefined) {
    updateFields.push(`category_id = $${paramCounter++}`);
    values.push(category_id);
  }

  if (status !== undefined) {
    updateFields.push(`status = $${paramCounter++}`);
    values.push(status);
  }

  if (meta_title !== undefined) {
    updateFields.push(`meta_title = $${paramCounter++}`);
    values.push(meta_title);
  }

  if (meta_description !== undefined) {
    updateFields.push(`meta_description = $${paramCounter++}`);
    values.push(meta_description);
  }

  // Always update updated_at to now()
  updateFields.push(`updated_at = NOW()`);

  // Add the WHERE clause parameter
  values.push(id);

  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update the blog post
    const updateQuery = `
      UPDATE blog_posts 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCounter} 
      RETURNING *
    `;
    
    const postResult = await client.query(updateQuery, values);
    const post = postResult.rows[0];

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tag associations
      await client.query('DELETE FROM blog_post_tags WHERE post_id = $1', [id]);
      
      // Add new tag associations
      if (tags.length > 0) {
        for (const tagId of tags) {
          await client.query(
            'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)',
            [id, tagId]
          );
        }
      }
    }

    await client.query('COMMIT');
    return post;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a blog post
 * @param {number} id 
 */
async function deleteBlogPost(id) {
  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete tag associations
    await client.query('DELETE FROM blog_post_tags WHERE post_id = $1', [id]);
    
    // Delete the post
    const result = await client.query('DELETE FROM blog_posts WHERE id = $1 RETURNING *', [id]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Blog Categories Functions

/**
 * List all blog categories
 */
async function listBlogCategories() {
  const result = await pool.query(`
    SELECT c.*, COUNT(bp.id) as post_count
    FROM blog_categories c
    LEFT JOIN blog_posts bp ON c.id = bp.category_id
    GROUP BY c.id
    ORDER BY c.name
  `);
  return result.rows;
}

/**
 * Get a blog category by ID
 * @param {number} id 
 */
async function getBlogCategoryById(id) {
  const result = await pool.query('SELECT * FROM blog_categories WHERE id = $1', [id]);
  return result.rows[0];
}

/**
 * Create a new blog category
 * @param {string} name 
 * @param {string} slug 
 * @param {string} description 
 */
async function createBlogCategory({ name, slug, description }) {
  const result = await pool.query(
    'INSERT INTO blog_categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
    [name, slug, description]
  );
  return result.rows[0];
}

/**
 * Update a blog category
 * @param {number} id 
 * @param {Object} categoryData 
 */
async function updateBlogCategory(id, { name, slug, description }) {
  const result = await pool.query(
    'UPDATE blog_categories SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
    [name, slug, description, id]
  );
  return result.rows[0];
}

/**
 * Delete a blog category
 * @param {number} id 
 */
async function deleteBlogCategory(id) {
  await pool.query('DELETE FROM blog_categories WHERE id = $1', [id]);
}

// Blog Tags Functions

/**
 * List all blog tags
 */
async function listBlogTags() {
  const result = await pool.query(`
    SELECT t.*, COUNT(bpt.post_id) as post_count
    FROM blog_tags t
    LEFT JOIN blog_post_tags bpt ON t.id = bpt.tag_id
    GROUP BY t.id
    ORDER BY t.name
  `);
  return result.rows;
}

/**
 * Get a blog tag by ID
 * @param {number} id 
 */
async function getBlogTagById(id) {
  const result = await pool.query('SELECT * FROM blog_tags WHERE id = $1', [id]);
  return result.rows[0];
}

/**
 * Create a new blog tag
 * @param {string} name 
 * @param {string} slug 
 * @param {string} description 
 */
async function createBlogTag({ name, slug, description }) {
  const result = await pool.query(
    'INSERT INTO blog_tags (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
    [name, slug, description]
  );
  return result.rows[0];
}

/**
 * Update a blog tag
 * @param {number} id 
 * @param {Object} tagData 
 */
async function updateBlogTag(id, { name, slug, description }) {
  const result = await pool.query(
    'UPDATE blog_tags SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
    [name, slug, description, id]
  );
  return result.rows[0];
}

/**
 * Delete a blog tag
 * @param {number} id 
 */
async function deleteBlogTag(id) {
  await pool.query('DELETE FROM blog_tags WHERE id = $1', [id]);
}

module.exports = {
  // Blog Posts
  listBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  
  // Blog Categories
  listBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  
  // Blog Tags
  listBlogTags,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  
  // Types for TypeScript
  BlogPostFilters
}; 