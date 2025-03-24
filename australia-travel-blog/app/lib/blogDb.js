import { pool } from './db';
import slugify from 'slugify';

/**
 * Initialize the blog database tables
 * @returns {Promise<boolean>} Success status
 */
export async function initializeBlogDatabase() {
  try {
    // Drop existing tables if they exist
    await pool.query(`
      DROP TABLE IF EXISTS blog_post_tags CASCADE;
      DROP TABLE IF EXISTS blog_tags CASCADE;
      DROP TABLE IF EXISTS blog_posts CASCADE;
      DROP TABLE IF EXISTS blog_categories CASCADE;
    `);

    // Create blog_categories table
    await pool.query(`
      CREATE TABLE blog_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
    `);

    // Create blog_posts table
    await pool.query(`
      CREATE TABLE blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(300) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image VARCHAR(255),
        author_id INTEGER REFERENCES users(id),
        category_id INTEGER REFERENCES blog_categories(id),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        meta_title VARCHAR(255),
        meta_description TEXT,
        views_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'draft'
      );
      
      CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
      CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
      CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
      CREATE INDEX idx_blog_posts_published ON blog_posts(published);
      CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
      CREATE INDEX idx_blog_posts_status ON blog_posts(status);
    `);

    // Create blog_tags table
    await pool.query(`
      CREATE TABLE blog_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);
    `);

    // Create blog_post_tags table (junction table for many-to-many relationship)
    await pool.query(`
      CREATE TABLE blog_post_tags (
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES blog_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );
      
      CREATE INDEX idx_blog_post_tags_post_id ON blog_post_tags(post_id);
      CREATE INDEX idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);
    `);

    // Insert sample categories
    await pool.query(`
      INSERT INTO blog_categories (name, slug, description)
      VALUES 
        ('Travel Tips', 'travel-tips', 'Helpful advice for travelers'),
        ('Destinations', 'destinations', 'Explore amazing places across Australia'),
        ('Adventure', 'adventure', 'Thrilling experiences and activities'),
        ('Food & Dining', 'food-dining', 'Culinary experiences and restaurant reviews'),
        ('Accommodation', 'accommodation', 'Hotels, resorts, and places to stay');
    `);

    // Insert sample tags
    await pool.query(`
      INSERT INTO blog_tags (name, slug)
      VALUES 
        ('Beach', 'beach'),
        ('Wildlife', 'wildlife'),
        ('City', 'city'),
        ('Hiking', 'hiking'),
        ('Budget', 'budget'),
        ('Luxury', 'luxury'),
        ('Family', 'family'),
        ('Solo Travel', 'solo-travel'),
        ('Road Trip', 'road-trip'),
        ('Photography', 'photography');
    `);

    // Generate a couple of sample blog posts
    const samplePosts = [
      {
        title: 'Top 10 Beaches in Australia You Must Visit',
        content: `<p>Australia is home to some of the world's most stunning beaches. From the iconic Bondi Beach to the pristine white sands of Whitehaven Beach, there's a coastal paradise for every type of traveler.</p>
        <h2>1. Whitehaven Beach, Whitsunday Islands</h2>
        <p>Known for its crystal clear waters and pure silica sand, Whitehaven Beach stretches over 7 kilometers and is consistently rated as one of the world's best beaches.</p>
        <h2>2. Bondi Beach, Sydney</h2>
        <p>Perhaps Australia's most famous beach, Bondi offers excellent surfing, a vibrant atmosphere, and is just a short drive from Sydney's CBD.</p>
        <p>...</p>`,
        excerpt: 'Discover the most beautiful coastal spots Australia has to offer, from secluded bays to popular surfing destinations.',
        featured_image: '/images/blog/beaches.jpg',
        category: 'Destinations',
        tags: ['Beach', 'Photography', 'Family'],
        published: true
      },
      {
        title: 'How to Plan Your Great Ocean Road Adventure',
        content: `<p>The Great Ocean Road is one of Australia's most scenic drives, spanning 243 kilometers along the stunning Victorian coastline.</p>
        <h2>When to Visit</h2>
        <p>The best time to drive the Great Ocean Road is during the summer months (December to February) when the weather is warm and ideal for beach stops. However, visiting during shoulder seasons (March-May or September-November) means fewer crowds and mild temperatures.</p>
        <h2>Essential Stops</h2>
        <p>While the Twelve Apostles are the most famous attraction, don't miss these other highlights:</p>
        <ul>
          <li>Loch Ard Gorge</li>
          <li>London Arch (formerly London Bridge)</li>
          <li>Apollo Bay</li>
          <li>Great Otway National Park</li>
          <li>Bells Beach</li>
        </ul>
        <p>...</p>`,
        excerpt: "A comprehensive guide to driving one of the world's most scenic coastal routes, with itinerary suggestions and the best spots to visit.",
        featured_image: '/images/blog/great-ocean-road.jpg',
        category: 'Road Trip',
        tags: ['Road Trip', 'Photography', 'Adventure'],
        published: true
      }
    ];

    // Insert sample blog posts
    for (const post of samplePosts) {
      // Get category ID
      const categoryResult = await pool.query(
        'SELECT id FROM blog_categories WHERE name = $1',
        [post.category]
      );
      
      const categoryId = categoryResult.rows[0]?.id || null;
      
      // Create slug from title
      const slug = slugify(post.title, {
        lower: true,
        strict: true
      });
      
      // Insert blog post
      const postResult = await pool.query(
        `INSERT INTO blog_posts (
          title, slug, content, excerpt, featured_image, 
          category_id, published, published_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          post.title,
          slug,
          post.content,
          post.excerpt,
          post.featured_image,
          categoryId,
          post.published,
          post.published ? new Date() : null
        ]
      );
      
      const postId = postResult.rows[0].id;
      
      // Add tags
      for (const tagName of post.tags) {
        const tagResult = await pool.query(
          'SELECT id FROM blog_tags WHERE name = $1',
          [tagName]
        );
        
        if (tagResult.rows.length > 0) {
          await pool.query(
            'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)',
            [postId, tagResult.rows[0].id]
          );
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing blog database:', error);
    throw error;
  }
}

/**
 * Get a list of blog posts with pagination and filters
 * @param {object} options - Filter and pagination options
 * @returns {Promise<{posts: Array, total: number}>} Posts and total count
 */
async function listBlogPosts({
  page = 1,
  limit = 10,
  categoryId = null,
  tagId = null,
  search = null,
  published = null,
  authorId = null,
  sortBy = 'created_at',
  sortOrder = 'DESC'
} = {}) {
  try {
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;
    
    // Base query
    let query = `
      SELECT 
        p.id, p.title, p.slug, p.excerpt, p.featured_image,
        p.published, p.published_at, p.created_at, p.updated_at,
        p.views_count,
        c.name AS category_name, c.slug AS category_slug,
        u.name AS author_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
    `;
    
    // Where conditions
    const conditions = [];
    
    if (published !== null) {
      conditions.push(`p.published = $${paramIndex++}`);
      params.push(published);
    }
    
    if (categoryId) {
      conditions.push(`p.category_id = $${paramIndex++}`);
      params.push(categoryId);
    }
    
    if (authorId) {
      conditions.push(`p.author_id = $${paramIndex++}`);
      params.push(authorId);
    }
    
    if (search) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (tagId) {
      query += ` JOIN blog_post_tags pt ON p.id = pt.post_id`;
      conditions.push(`pt.tag_id = $${paramIndex++}`);
      params.push(tagId);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add order by
    query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    
    // Add limit and offset
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM blog_posts p
    `;
    
    if (tagId) {
      countQuery += ` JOIN blog_post_tags pt ON p.id = pt.post_id`;
    }
    
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);
    
    // Get tags for each post
    const posts = await Promise.all(
      result.rows.map(async (post) => {
        const tagsResult = await pool.query(`
          SELECT t.id, t.name, t.slug
          FROM blog_tags t
          JOIN blog_post_tags pt ON t.id = pt.tag_id
          WHERE pt.post_id = $1
        `, [post.id]);
        
        return {
          ...post,
          tags: tagsResult.rows
        };
      })
    );
    
    return {
      posts,
      total
    };
  } catch (error) {
    console.error('Error listing blog posts:', error);
    throw error;
  }
}

/**
 * Get a single blog post by slug
 * @param {string} slug - Post slug
 * @param {boolean} incrementViews - Whether to increment view count
 * @returns {Promise<object|null>} Blog post or null if not found
 */
async function getBlogPostBySlug(slug, incrementViews = false) {
  try {
    // Get post with category
    const postResult = await pool.query(`
      SELECT 
        p.id, p.title, p.slug, p.content, p.excerpt, p.featured_image,
        p.author_id, p.category_id, p.published, p.published_at,
        p.created_at, p.updated_at, p.meta_title, p.meta_description,
        p.views_count, p.status,
        c.name AS category_name, c.slug AS category_slug,
        u.name AS author_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1
    `, [slug]);
    
    if (postResult.rows.length === 0) {
      return null;
    }
    
    const post = postResult.rows[0];
    
    // Increment view count if requested
    if (incrementViews) {
      await pool.query(
        'UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1',
        [post.id]
      );
      post.views_count += 1;
    }
    
    // Get post tags
    const tagsResult = await pool.query(`
      SELECT t.id, t.name, t.slug
      FROM blog_tags t
      JOIN blog_post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = $1
    `, [post.id]);
    
    // Add tags to post
    post.tags = tagsResult.rows;
    
    return post;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    throw error;
  }
}

/**
 * Get a blog post by ID with categories and tags
 * @param {number} id - Post ID
 * @returns {Promise<object|null>} Blog post or null if not found
 */
async function getBlogPostById(id) {
  try {
    // Get post with category
    const postResult = await pool.query(`
      SELECT 
        p.id, p.title, p.slug, p.content, p.excerpt, p.featured_image,
        p.author_id, p.category_id, p.published, p.published_at,
        p.created_at, p.updated_at, p.meta_title, p.meta_description,
        p.views_count, p.status,
        c.name AS category_name, c.slug AS category_slug,
        u.name AS author_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);
    
    if (postResult.rows.length === 0) {
      return null;
    }
    
    const post = postResult.rows[0];
    
    // Get post tags
    const tagsResult = await pool.query(`
      SELECT t.id, t.name, t.slug
      FROM blog_tags t
      JOIN blog_post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = $1
    `, [id]);
    
    // Add tags to post
    post.tags = tagsResult.rows;
    
    return post;
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    throw error;
  }
}

/**
 * Create a new blog post
 * @param {object} postData - Blog post data
 * @returns {Promise<object>} Created blog post
 */
async function createBlogPost(postData) {
  const {
    title,
    content,
    excerpt,
    featured_image,
    author_id,
    category_id,
    tags,
    published,
    meta_title,
    meta_description,
    status,
    publish_date
  } = postData;
  
  let slug = postData.slug;
  
  // Generate slug if not provided
  if (!slug) {
    slug = slugify(title, {
      lower: true,
      strict: true
    });
  }
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // Determine published state and published_at date
    let isPublished = published;
    let publishedAt = null;
    
    if (status === 'published') {
      isPublished = true;
      publishedAt = new Date();
    } else if (status === 'scheduled' && publish_date) {
      isPublished = false;
      publishedAt = new Date(publish_date);
    } else if (published) {
      // For backward compatibility
      isPublished = true;
      publishedAt = new Date();
    }
    
    // Insert blog post
    const postResult = await pool.query(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, featured_image, author_id,
        category_id, published, published_at, meta_title, meta_description, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [
      title,
      slug,
      content,
      excerpt,
      featured_image,
      author_id,
      category_id,
      isPublished,
      publishedAt,
      meta_title,
      meta_description,
      status || (isPublished ? 'published' : 'draft')
    ]);
    
    const postId = postResult.rows[0].id;
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        await pool.query(
          'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)',
          [postId, tagId]
        );
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    // Return the created post
    return getBlogPostBySlug(slug);
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error creating blog post:', error);
    throw error;
  }
}

/**
 * Update an existing blog post
 * @param {number} id - Post ID
 * @param {object} postData - Blog post data to update
 * @returns {Promise<object|null>} Updated blog post or null if not found
 */
async function updateBlogPost(id, postData) {
  const {
    title,
    content,
    excerpt,
    featured_image,
    author_id,
    category_id,
    tags,
    published,
    meta_title,
    meta_description,
    status,
    publish_date
  } = postData;
  
  let { slug } = postData;
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // Check if post exists
    const existsResult = await pool.query(
      'SELECT id, slug FROM blog_posts WHERE id = $1',
      [id]
    );
    
    if (existsResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return null;
    }
    
    const originalSlug = existsResult.rows[0].slug;
    
    // Generate new slug if title changed and slug was not manually provided
    if (title && !slug) {
      slug = slugify(title, {
        lower: true,
        strict: true
      });
    }
    
    // Determine published state and published_at date
    let isPublished = published;
    let publishedAt = null;
    
    if (status === 'published') {
      isPublished = true;
      publishedAt = new Date();
    } else if (status === 'scheduled' && publish_date) {
      isPublished = false;
      publishedAt = new Date(publish_date);
    } else if (published) {
      // For backward compatibility
      isPublished = true;
      publishedAt = new Date();
    }
    
    // Update query parts
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (title) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    
    if (slug && slug !== originalSlug) {
      updateFields.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }
    
    if (content) {
      updateFields.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    
    // Handle excerpt (can be empty)
    if (excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramIndex++}`);
      values.push(excerpt);
    }
    
    if (featured_image !== undefined) {
      updateFields.push(`featured_image = $${paramIndex++}`);
      values.push(featured_image);
    }
    
    if (author_id) {
      updateFields.push(`author_id = $${paramIndex++}`);
      values.push(author_id);
    }
    
    // Allow removing category with null
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      values.push(category_id);
    }
    
    if (isPublished !== undefined) {
      updateFields.push(`published = $${paramIndex++}`);
      values.push(isPublished);
    }
    
    // Update published_at date if provided
    if (publishedAt !== null) {
      updateFields.push(`published_at = $${paramIndex++}`);
      values.push(publishedAt);
    }
    
    if (meta_title !== undefined) {
      updateFields.push(`meta_title = $${paramIndex++}`);
      values.push(meta_title);
    }
    
    if (meta_description !== undefined) {
      updateFields.push(`meta_description = $${paramIndex++}`);
      values.push(meta_description);
    }
    
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    
    // Always update updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    
    // Add post ID as the last parameter
    values.push(id);
    
    // Execute update if there are fields to update
    if (updateFields.length > 0) {
      const query = `
        UPDATE blog_posts
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;
      
      await pool.query(query, values);
    }
    
    // Update tags if provided
    if (tags) {
      // Remove existing tags
      await pool.query(
        'DELETE FROM blog_post_tags WHERE post_id = $1',
        [id]
      );
      
      // Add new tags
      if (tags.length > 0) {
        for (const tagId of tags) {
          await pool.query(
            'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)',
            [id, tagId]
          );
        }
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    // Return the updated post
    return await getBlogPostById(id);
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error updating blog post:', error);
    throw error;
  }
}

/**
 * Delete a blog post
 * @param {number} id - Post ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteBlogPost(id) {
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // Delete tag associations
    await pool.query('DELETE FROM blog_post_tags WHERE post_id = $1', [id]);
    
    // Delete the post
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    return result.rowCount > 0;
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error deleting blog post:', error);
    throw error;
  }
}

/**
 * Get a list of blog categories
 * @returns {Promise<Array>} Blog categories
 */
async function listBlogCategories() {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(bp.id) as post_count
      FROM blog_categories c
      LEFT JOIN blog_posts bp ON c.id = bp.category_id
      GROUP BY c.id
      ORDER BY name ASC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error listing blog categories:', error);
    throw error;
  }
}

/**
 * Get a blog category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Blog category
 */
async function getBlogCategoryById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM blog_categories WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting blog category by ID:', error);
    throw error;
  }
}

/**
 * Create a new blog category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name
 * @param {string} categoryData.slug - Category slug (optional)
 * @param {string} categoryData.description - Category description (optional)
 * @returns {Promise<Object>} Created blog category
 */
async function createBlogCategory({ name, slug, description }) {
  try {
    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await pool.query(
      'INSERT INTO blog_categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, finalSlug, description]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating blog category:', error);
    throw error;
  }
}

/**
 * Update a blog category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name
 * @param {string} categoryData.slug - Category slug (optional)
 * @param {string} categoryData.description - Category description (optional)
 * @returns {Promise<Object>} Updated blog category
 */
async function updateBlogCategory(id, { name, slug, description }) {
  try {
    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await pool.query(
      'UPDATE blog_categories SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, finalSlug, description, id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating blog category:', error);
    throw error;
  }
}

/**
 * Delete a blog category
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 */
async function deleteBlogCategory(id) {
  try {
    await pool.query('DELETE FROM blog_categories WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting blog category:', error);
    throw error;
  }
}

/**
 * Get a list of blog tags
 * @returns {Promise<Array>} Blog tags
 */
async function listBlogTags() {
  try {
    const result = await pool.query(`
      SELECT t.*, COUNT(bpt.post_id) as post_count
      FROM blog_tags t
      LEFT JOIN blog_post_tags bpt ON t.id = bpt.tag_id
      GROUP BY t.id
      ORDER BY name ASC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error listing blog tags:', error);
    throw error;
  }
}

/**
 * Get a blog tag by ID
 * @param {number} id - Tag ID
 * @returns {Promise<Object>} Blog tag
 */
async function getBlogTagById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM blog_tags WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting blog tag by ID:', error);
    throw error;
  }
}

/**
 * Create a new blog tag
 * @param {Object} tagData - Tag data
 * @param {string} tagData.name - Tag name
 * @param {string} tagData.slug - Tag slug (optional)
 * @returns {Promise<Object>} Created blog tag
 */
async function createBlogTag({ name, slug }) {
  try {
    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await pool.query(
      'INSERT INTO blog_tags (name, slug) VALUES ($1, $2) RETURNING *',
      [name, finalSlug]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating blog tag:', error);
    throw error;
  }
}

/**
 * Update a blog tag
 * @param {number} id - Tag ID
 * @param {Object} tagData - Tag data
 * @param {string} tagData.name - Tag name
 * @param {string} tagData.slug - Tag slug (optional)
 * @returns {Promise<Object>} Updated blog tag
 */
async function updateBlogTag(id, { name, slug }) {
  try {
    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await pool.query(
      'UPDATE blog_tags SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
      [name, finalSlug, id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating blog tag:', error);
    throw error;
  }
}

/**
 * Delete a blog tag
 * @param {number} id - Tag ID
 * @returns {Promise<void>}
 */
async function deleteBlogTag(id) {
  try {
    await pool.query('DELETE FROM blog_tags WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting blog tag:', error);
    throw error;
  }
}

export {
  listBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  listBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  listBlogTags,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
};