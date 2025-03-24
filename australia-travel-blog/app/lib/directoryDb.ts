import { pool } from './db.js';

// Updated DirectoryListing interface to include structured location data
export interface DirectoryListing {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  description?: string;
  location?: string;
  location_data?: {
    lat: number;
    lng: number;
    address: string;
  } | string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  price_range?: string;
  images?: any;
  hours?: any;
  website?: string;
  phone?: string;
  email?: string;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

// Directory Category interface
export interface DirectoryCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Update getDirectoryListingBySlug to handle structured location data
export async function getDirectoryListingBySlug(slug: string): Promise<DirectoryListing | null> {
  try {
    const query = `
      SELECT 
        d.*, 
        c.name as category_name, 
        c.slug as category_slug
      FROM directory_listings d
      LEFT JOIN directory_categories c ON d.category_id = c.id
      WHERE d.slug = $1
    `;
    const result = await pool.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const listing = result.rows[0];
    
    // Parse JSON fields
    if (listing.images && typeof listing.images === 'string') {
      listing.images = JSON.parse(listing.images);
    }
    
    if (listing.hours && typeof listing.hours === 'string') {
      listing.hours = JSON.parse(listing.hours);
    }
    
    // Handle location data
    if (listing.location_data && typeof listing.location_data === 'string') {
      listing.location_data = JSON.parse(listing.location_data);
      
      // Set coordinates field for backward compatibility
      if (listing.location_data.lat && listing.location_data.lng) {
        listing.coordinates = {
          lat: listing.location_data.lat,
          lng: listing.location_data.lng
        };
      }
    }
    
    return listing;
  } catch (error) {
    console.error('Error fetching directory listing by slug:', error);
    return null;
  }
}

// Update the createDirectoryListing function to save structured location data
export async function createDirectoryListing(data: Partial<DirectoryListing>): Promise<number | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Process location data
    let location = data.location;
    let locationData = data.location_data;
    
    // If we have structured location data, ensure it's stored properly
    if (locationData) {
      // Save as JSON if needed
      if (typeof locationData !== 'string') {
        locationData = JSON.stringify(locationData);
      }
      
      // Update the location string from the address if not provided
      if (!location && typeof data.location_data === 'object' && data.location_data?.address) {
        location = data.location_data.address;
      }
    }
    
    // Process images and hours
    const images = data.images ? (typeof data.images === 'string' ? data.images : JSON.stringify(data.images)) : null;
    const hours = data.hours ? (typeof data.hours === 'string' ? data.hours : JSON.stringify(data.hours)) : null;
    
    // Generate slug if not provided
    let slug = data.slug;
    if (!slug && data.name) {
      slug = data.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    
    // If slug exists, check for duplicates and add a suffix if needed
    if (slug) {
      const duplicateCheck = await client.query('SELECT slug FROM directory_listings WHERE slug = $1', [slug]);
      if (duplicateCheck.rows.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }
    
    const query = `
      INSERT INTO directory_listings (
        name, slug, category_id, description, location, location_data,
        price_range, images, hours, website, phone, email, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;
    
    const values = [
      data.name,
      slug,
      data.category_id,
      data.description,
      location,
      locationData,
      data.price_range,
      images,
      hours,
      data.website,
      data.phone,
      data.email,
      data.featured || false
    ];
    
    const result = await client.query(query, values);
    await client.query('COMMIT');
    
    return result.rows[0].id;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating directory listing:', error);
    return null;
  } finally {
    client.release();
  }
}

// Update the updateDirectoryListing function for structured location data
export async function updateDirectoryListing(id: number, data: Partial<DirectoryListing>): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Process location data
    let location = data.location;
    let locationData = data.location_data;
    
    if (locationData) {
      // Save as JSON if needed
      if (typeof locationData !== 'string') {
        locationData = JSON.stringify(locationData);
      }
      
      // Update the location string from the address if provided
      if (typeof data.location_data === 'object' && data.location_data?.address) {
        location = data.location_data.address;
      }
    }
    
    // Process images and hours
    const images = data.images ? (typeof data.images === 'string' ? data.images : JSON.stringify(data.images)) : undefined;
    const hours = data.hours ? (typeof data.hours === 'string' ? data.hours : JSON.stringify(data.hours)) : undefined;
    
    // Check if slug is being changed and verify it doesn't conflict
    if (data.slug) {
      const duplicateCheck = await client.query(
        'SELECT slug FROM directory_listings WHERE slug = $1 AND id != $2', 
        [data.slug, id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
      }
    }
    
    // Build dynamic query based on what fields are being updated
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const fieldMap: Record<string, any> = {
      name: data.name,
      slug: data.slug,
      category_id: data.category_id,
      description: data.description,
      location: location,
      location_data: locationData,
      price_range: data.price_range,
      images: images,
      hours: hours,
      website: data.website,
      phone: data.phone,
      email: data.email,
      featured: data.featured,
      updated_at: 'NOW()'
    };
    
    for (const [field, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      await client.query('COMMIT');
      return true; // Nothing to update
    }
    
    values.push(id);
    const query = `
      UPDATE directory_listings
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;
    
    await client.query(query, values);
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating directory listing:', error);
    return false;
  } finally {
    client.release();
  }
}

// Update the listDirectoryListings function to return structured location data
export async function listDirectoryListings(options: {
  page?: number;
  limit?: number;
  categoryId?: number;
  featured?: boolean;
  location?: string;
  search?: string;
  sort?: string;
}): Promise<{ listings: DirectoryListing[]; total: number; pages: number }> {
  const {
    page = 1,
    limit = 10,
    categoryId,
    featured,
    location,
    search,
    sort = 'name_asc'
  } = options;
  
  const offset = (page - 1) * limit;
  
  try {
    let query = `
      SELECT 
        d.*, 
        c.name as category_name, 
        c.slug as category_slug
      FROM directory_listings d
      LEFT JOIN directory_categories c ON d.category_id = c.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    // Add filters
    if (categoryId) {
      query += ` AND d.category_id = $${paramIndex}`;
      queryParams.push(categoryId);
      paramIndex++;
    }
    
    if (featured !== undefined) {
      query += ` AND d.featured = $${paramIndex}`;
      queryParams.push(featured);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND d.location ILIKE $${paramIndex}`;
      queryParams.push(`%${location}%`);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (
        d.name ILIKE $${paramIndex} OR
        d.description ILIKE $${paramIndex} OR
        d.location ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Add sorting
    if (sort === 'name_asc') {
      query += ' ORDER BY d.name ASC';
    } else if (sort === 'name_desc') {
      query += ' ORDER BY d.name DESC';
    } else if (sort === 'newest') {
      query += ' ORDER BY d.created_at DESC';
    } else if (sort === 'featured') {
      query += ' ORDER BY d.featured DESC, d.name ASC';
    }
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Process results
    const listings = result.rows.map((listing: any) => {
      // Parse JSON fields
      if (listing.images && typeof listing.images === 'string') {
        listing.images = JSON.parse(listing.images);
      }
      
      if (listing.hours && typeof listing.hours === 'string') {
        listing.hours = JSON.parse(listing.hours);
      }
      
      // Handle structured location data
      if (listing.location_data && typeof listing.location_data === 'string') {
        listing.location_data = JSON.parse(listing.location_data);
        
        // Set coordinates field for backward compatibility
        if (listing.location_data.lat && listing.location_data.lng) {
          listing.coordinates = {
            lat: listing.location_data.lat,
            lng: listing.location_data.lng
          };
        }
      }
      
      return listing;
    });
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM directory_listings d
      LEFT JOIN directory_categories c ON d.category_id = c.id
      WHERE 1=1
    `;
    
    // Remove LIMIT and OFFSET from the params
    queryParams.splice(-2, 2);
    
    // Use a simpler approach for the count query
    const countResult = await pool.query(countQuery, []);
    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);
    
    return { listings, total, pages };
  } catch (error) {
    console.error('Error listing directory listings:', error);
    return { listings: [], total: 0, pages: 0 };
  }
}

// Get all directory categories
export async function listDirectoryCategories(): Promise<DirectoryCategory[]> {
  try {
    const query = `
      SELECT * FROM directory_categories
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error listing directory categories:', error);
    return [];
  }
}

// Get directory category by slug
export async function getDirectoryCategoryBySlug(slug: string): Promise<DirectoryCategory | null> {
  try {
    const query = `
      SELECT * FROM directory_categories
      WHERE slug = $1
    `;
    
    const result = await pool.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching directory category by slug:', error);
    return null;
  }
}

// Create a new directory category
export async function createDirectoryCategory(
  name: string, 
  slug: string, 
  description?: string
): Promise<DirectoryCategory | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check for duplicate slug
    const duplicateCheck = await client.query(
      'SELECT slug FROM directory_categories WHERE slug = $1', 
      [slug]
    );
    
    if (duplicateCheck.rows.length > 0) {
      // Add timestamp to make slug unique
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    
    const query = `
      INSERT INTO directory_categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [name, slug, description];
    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating directory category:', error);
    return null;
  } finally {
    client.release();
  }
}
