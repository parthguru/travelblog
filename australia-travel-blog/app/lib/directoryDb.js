// lib/directoryDb.js
import { pool } from './db.js';

export async function createDirectoryCategory(name, slug, description = null) {
  const result = await pool.query(
    'INSERT INTO directory_categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
    [name, slug, description]
  );
  return result.rows[0];
}

export async function getDirectoryCategoryBySlug(slug) {
  const result = await pool.query(
    'SELECT * FROM directory_categories WHERE slug = $1',
    [slug]
  );
  return result.rows[0];
}

export async function listDirectoryCategories() {
  const result = await pool.query(
    'SELECT * FROM directory_categories ORDER BY name ASC'
  );
  return result.rows;
}

export async function updateDirectoryCategory(id, name, slug, description = null) {
  const result = await pool.query(
    'UPDATE directory_categories SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
    [name, slug, description, id]
  );
  return result.rows[0];
}

export async function deleteDirectoryCategory(id) {
  await pool.query('DELETE FROM directory_categories WHERE id = $1', [id]);
  return true;
}

export async function createDirectoryListing(listingData) {
  const {
    name,
    description,
    location,
    address,
    latitude,
    longitude,
    website,
    phone,
    email,
    price_range,
    hours,
    images,
    category_id,
    slug,
    featured = false
  } = listingData;
  
  const result = await pool.query(
    `INSERT INTO directory_listings (
      name, description, location, address, latitude, longitude,
      website, phone, email, price_range, hours, images,
      category_id, slug, featured
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
    [
      name,
      description,
      location,
      address,
      latitude,
      longitude,
      website,
      phone,
      email,
      price_range,
      JSON.stringify(hours),
      JSON.stringify(images),
      category_id,
      slug,
      featured
    ]
  );
  return result.rows[0];
}

export async function getDirectoryListingBySlug(slug) {
  const result = await pool.query(
    `SELECT 
      l.*,
      c.name as category_name,
      c.slug as category_slug
     FROM directory_listings l
     JOIN directory_categories c ON l.category_id = c.id
     WHERE l.slug = $1`,
    [slug]
  );
  
  const listing = result.rows[0];
  
  if (listing) {
    // Parse JSON fields
    if (listing.hours && typeof listing.hours === 'string') {
      listing.hours = JSON.parse(listing.hours);
    }
    
    if (listing.images && typeof listing.images === 'string') {
      listing.images = JSON.parse(listing.images);
    }
  }
  
  return listing;
}

export async function listDirectoryListings({
  categoryId = null,
  location = null,
  priceRange = null,
  featured = null,
  search = null,
  page = 1,
  limit = 10,
  sort = 'name',
  order = 'ASC'
} = {}) {
  let query = `
    SELECT 
      l.*,
      c.name as category_name,
      c.slug as category_slug
    FROM directory_listings l
    JOIN directory_categories c ON l.category_id = c.id
  `;
  
  const queryParams = [];
  let whereConditions = [];
  
  // Add category filter
  if (categoryId) {
    queryParams.push(categoryId);
    whereConditions.push(`l.category_id = $${queryParams.length}`);
  }
  
  // Add location filter
  if (location) {
    queryParams.push(location);
    whereConditions.push(`l.location = $${queryParams.length}`);
  }
  
  // Add price range filter
  if (priceRange) {
    queryParams.push(priceRange);
    whereConditions.push(`l.price_range = $${queryParams.length}`);
  }
  
  // Add featured filter
  if (featured !== null) {
    queryParams.push(featured);
    whereConditions.push(`l.featured = $${queryParams.length}`);
  }
  
  // Add search filter
  if (search) {
    queryParams.push(`%${search}%`);
    whereConditions.push(`(
      l.name ILIKE $${queryParams.length} OR
      l.description ILIKE $${queryParams.length} OR
      l.location ILIKE $${queryParams.length}
    )`);
  }
  
  // Add WHERE clause if there are conditions
  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  // Validate sort field to prevent SQL injection
  const validSortFields = ['name', 'created_at', 'updated_at', 'location', 'price_range'];
  if (!validSortFields.includes(sort)) {
    sort = 'name';
  }
  
  // Validate sort order to prevent SQL injection
  order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  // Add ORDER BY clause
  query += ` ORDER BY l.${sort} ${order}`;
  
  // Add pagination
  const offset = (page - 1) * limit;
  queryParams.push(limit, offset);
  query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  
  // Execute query
  const result = await pool.query(query, queryParams);
  
  // Count total results (without pagination)
  let countQuery = `
    SELECT COUNT(*) FROM directory_listings l
    JOIN directory_categories c ON l.category_id = c.id
  `;
  
  if (whereConditions.length > 0) {
    countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  const countResult = await pool.query(
    countQuery,
    queryParams.slice(0, -2) // Remove limit and offset params
  );
  
  const total = parseInt(countResult.rows[0].count);
  
  // Process listings to parse JSON fields
  const listings = result.rows.map(listing => {
    // Parse hours and images if they're stored as JSON strings
    if (listing.hours && typeof listing.hours === 'string') {
      listing.hours = JSON.parse(listing.hours);
    }
    
    if (listing.images && typeof listing.images === 'string') {
      listing.images = JSON.parse(listing.images);
    }
    
    return listing;
  });
  
  return {
    listings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function listDirectoryListingsByCategorySlug(categorySlug, options = {}) {
  const category = await getDirectoryCategoryBySlug(categorySlug);
  if (!category) {
    return { listings: [], total: 0, page: 1, limit: options.limit || 10, totalPages: 0 };
  }
  
  return listDirectoryListings({
    ...options,
    categoryId: category.id
  });
}

export async function updateDirectoryListing(id, listingData) {
  const {
    name,
    description,
    location,
    address,
    latitude,
    longitude,
    website,
    phone,
    email,
    price_range,
    hours,
    images,
    category_id,
    slug,
    featured
  } = listingData;
  
  const result = await pool.query(
    `UPDATE directory_listings SET
      name = $1,
      description = $2,
      location = $3,
      address = $4,
      latitude = $5,
      longitude = $6,
      website = $7,
      phone = $8,
      email = $9,
      price_range = $10,
      hours = $11,
      images = $12,
      category_id = $13,
      slug = $14,
      featured = $15,
      updated_at = NOW()
    WHERE id = $16 RETURNING *`,
    [
      name,
      description,
      location,
      address,
      latitude,
      longitude,
      website,
      phone,
      email,
      price_range,
      JSON.stringify(hours),
      JSON.stringify(images),
      category_id,
      slug,
      featured,
      id
    ]
  );
  
  return result.rows[0];
}

export async function deleteDirectoryListing(id) {
  await pool.query('DELETE FROM directory_listings WHERE id = $1', [id]);
  return true;
}

export async function countDirectoryListingsByLocation(categoryId = null) {
  let query = `
    SELECT location, COUNT(*) as count
    FROM directory_listings
  `;
  
  const params = [];
  
  if (categoryId) {
    query += ' WHERE category_id = $1';
    params.push(categoryId);
  }
  
  query += ' GROUP BY location ORDER BY location ASC';
  
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getDistinctPriceRanges(categoryId = null) {
  let query = `
    SELECT DISTINCT price_range
    FROM directory_listings
  `;
  
  const params = [];
  
  if (categoryId) {
    query += ' WHERE category_id = $1';
    params.push(categoryId);
  }
  
  query += ' ORDER BY price_range ASC';
  
  const result = await pool.query(query, params);
  return result.rows.map(row => row.price_range).filter(Boolean);
}

export async function initializeDatabase() {
  // Implementation of database initialization
  // This would create tables, indexes, and maybe seed initial data
  
  // Initialize review tables
  await initializeReviewTables();
  
  return true;
}

export async function createDirectoryReview({ listing_id, user_id, user_name, rating, content }) {
  try {
    const result = await pool.query(
      `INSERT INTO directory_reviews 
       (listing_id, user_id, user_name, rating, content, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [listing_id, user_id, user_name, rating, content]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating directory review:', error);
    throw error;
  }
}

export async function getDirectoryReviews(listingId) {
  try {
    const result = await pool.query(
      `SELECT 
        r.id, 
        r.user_name, 
        r.rating, 
        r.content, 
        r.created_at, 
        r.helpful_count,
        (
          SELECT json_build_object(
            'content', rr.content,
            'created_at', rr.created_at,
            'respondent_name', rr.respondent_name
          )
          FROM directory_review_responses rr
          WHERE rr.review_id = r.id
          LIMIT 1
        ) as response
       FROM directory_reviews r
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC`,
      [listingId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching directory reviews:', error);
    throw error;
  }
}

export async function updateDirectoryReviewHelpful(reviewId, increment = true) {
  try {
    const result = await pool.query(
      `UPDATE directory_reviews
       SET helpful_count = CASE WHEN $2 THEN helpful_count + 1 ELSE GREATEST(0, helpful_count - 1) END
       WHERE id = $1
       RETURNING *`,
      [reviewId, increment]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating review helpful count:', error);
    throw error;
  }
}

export async function createDirectoryReviewResponse(reviewId, content, respondentName) {
  try {
    const result = await pool.query(
      `INSERT INTO directory_review_responses
       (review_id, content, respondent_name, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [reviewId, content, respondentName]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating review response:', error);
    throw error;
  }
}

export async function reportDirectoryReview(reviewId, userId, reason) {
  try {
    const result = await pool.query(
      `INSERT INTO directory_review_reports
       (review_id, user_id, reason, reported_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [reviewId, userId, reason]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
}

export async function initializeReviewTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS directory_reviews (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL REFERENCES directory_listings(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT NOT NULL,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS directory_review_responses (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES directory_reviews(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        respondent_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS directory_review_reports (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES directory_reviews(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        reason TEXT,
        reported_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    
    console.log('Review tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing review tables:', error);
    throw error;
  }
}
