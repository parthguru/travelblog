import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function GET() {
  try {
    console.log('Initializing database...');
    
    // First check if the featured column exists, and add it if it doesn't
    try {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'directory_listings' AND column_name = 'featured'
          ) THEN
            ALTER TABLE directory_listings ADD COLUMN featured BOOLEAN DEFAULT FALSE;
          END IF;
        END
        $$;
      `);
      console.log('Checked for featured column and added if missing');
    } catch (error) {
      console.error('Error checking/adding featured column:', error);
    }

    // First, drop the existing tables if they exist
    await pool.query(`
      DROP TABLE IF EXISTS directory_listings;
      DROP TABLE IF EXISTS directory_categories;
    `);

    // Create the tables with the correct schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS directory_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS directory_listings (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES directory_categories(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        website VARCHAR(255),
        phone VARCHAR(100),
        email VARCHAR(255),
        price_range VARCHAR(50),
        hours JSONB,
        images JSONB,
        slug VARCHAR(255) UNIQUE NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_directory_listings_category_id ON directory_listings(category_id);
      CREATE INDEX IF NOT EXISTS idx_directory_listings_location ON directory_listings(location);
      CREATE INDEX IF NOT EXISTS idx_directory_listings_featured ON directory_listings(featured);
    `);

    // Insert sample data
    // First, create sample categories
    await pool.query(`
      INSERT INTO directory_categories (name, slug, description)
      VALUES 
        ('Hotels', 'hotels', 'Find accommodation options across Australia'),
        ('Restaurants', 'restaurants', 'Discover dining options and local cuisine'),
        ('Experiences', 'experiences', 'Explore activities and tours in Australia'),
        ('Tourist Places', 'tourist-places', 'Visit popular attractions and landmarks')
      ON CONFLICT DO NOTHING;
    `);
    
    // Get the category IDs
    const categoryResult = await pool.query('SELECT id, slug FROM directory_categories');
    const categories = {};
    categoryResult.rows.forEach(cat => {
      categories[cat.slug] = cat.id;
    });
    
    // Insert sample listings if categories exist
    if (Object.keys(categories).length > 0) {
      await pool.query(`
        INSERT INTO directory_listings (
          name, description, location, address, latitude, longitude, 
          website, phone, email, price_range, hours, images, 
          category_id, slug, featured
        ) VALUES 
          (
            'Oceanview Resort', 
            'Luxury beachfront resort with stunning ocean views and world-class amenities.', 
            'Sydney', 
            '123 Beach Road, Sydney, NSW 2000', 
            -33.865143, 
            151.209900, 
            'https://example.com/oceanview', 
            '+61 2 1234 5678', 
            'info@oceanviewresort.com', 
            '$$$', 
            '{"monday":"8:00 AM - 10:00 PM", "tuesday":"8:00 AM - 10:00 PM", "wednesday":"8:00 AM - 10:00 PM", "thursday":"8:00 AM - 10:00 PM", "friday":"8:00 AM - 11:00 PM", "saturday":"8:00 AM - 11:00 PM", "sunday":"8:00 AM - 10:00 PM"}', 
            '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1564501049412-61c2a3083791"]', 
            $1, 
            'oceanview-resort', 
            true
          ),
          (
            'Mountain Retreat', 
            'Peaceful mountain lodge surrounded by nature and hiking trails.', 
            'Blue Mountains', 
            '45 Mountain Way, Blue Mountains, NSW 2780', 
            -33.715143, 
            150.311599, 
            'https://example.com/mountain-retreat', 
            '+61 2 8765 4321', 
            'info@mountainretreat.com', 
            '$$', 
            '{"monday":"7:00 AM - 9:00 PM", "tuesday":"7:00 AM - 9:00 PM", "wednesday":"7:00 AM - 9:00 PM", "thursday":"7:00 AM - 9:00 PM", "friday":"7:00 AM - 10:00 PM", "saturday":"7:00 AM - 10:00 PM", "sunday":"7:00 AM - 9:00 PM"}', 
            '["https://images.unsplash.com/photo-1566675716782-5ec345077438", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]', 
            $1, 
            'mountain-retreat', 
            false
          ),
          (
            'Coastal Flavors', 
            'Fresh seafood restaurant with locally sourced ingredients and ocean views.', 
            'Melbourne', 
            '78 Harbor Street, Melbourne, VIC 3000', 
            -37.814107, 
            144.963280, 
            'https://example.com/coastal-flavors', 
            '+61 3 2345 6789', 
            'bookings@coastalflavors.com', 
            '$$', 
            '{"monday":"Closed", "tuesday":"11:30 AM - 10:00 PM", "wednesday":"11:30 AM - 10:00 PM", "thursday":"11:30 AM - 10:00 PM", "friday":"11:30 AM - 11:00 PM", "saturday":"11:30 AM - 11:00 PM", "sunday":"11:30 AM - 9:00 PM"}', 
            '["https://images.unsplash.com/photo-1514933651103-005eec06c04b", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"]', 
            $2, 
            'coastal-flavors', 
            true
          ),
          (
            'Great Ocean Road Tour', 
            'Guided tour of the iconic Great Ocean Road with stops at key landmarks.', 
            'Great Ocean Road', 
            'Starting from Melbourne CBD', 
            -38.360673, 
            144.030540, 
            'https://example.com/gor-tour', 
            '+61 3 3456 7890', 
            'bookings@goroadtours.com', 
            '$$', 
            '{"monday":"8:00 AM - 6:00 PM", "tuesday":"8:00 AM - 6:00 PM", "wednesday":"8:00 AM - 6:00 PM", "thursday":"8:00 AM - 6:00 PM", "friday":"8:00 AM - 6:00 PM", "saturday":"8:00 AM - 6:00 PM", "sunday":"8:00 AM - 6:00 PM"}', 
            '["https://images.unsplash.com/photo-1577791465485-b80039b4d69a", "https://images.unsplash.com/photo-1493375366763-3ed5e0e6d8ec"]', 
            $3, 
            'great-ocean-road-tour', 
            true
          ),
          (
            'Sydney Opera House', 
            'Iconic performing arts venue and architectural masterpiece.', 
            'Sydney', 
            'Bennelong Point, Sydney, NSW 2000', 
            -33.856784, 
            151.215297, 
            'https://example.com/opera-house', 
            '+61 2 9250 7111', 
            'info@sydneyoperahouse.com', 
            '$-$$$', 
            '{"monday":"9:00 AM - 5:00 PM", "tuesday":"9:00 AM - 5:00 PM", "wednesday":"9:00 AM - 5:00 PM", "thursday":"9:00 AM - 5:00 PM", "friday":"9:00 AM - 5:00 PM", "saturday":"9:00 AM - 5:00 PM", "sunday":"9:00 AM - 5:00 PM"}', 
            '["https://images.unsplash.com/photo-1540448051910-09cfadd5df61", "https://images.unsplash.com/photo-1549180030-48bf079fb38a"]', 
            $4, 
            'sydney-opera-house', 
            true
          )
        ON CONFLICT (slug) DO NOTHING;
      `, [categories.hotels, categories.restaurants, categories.experiences, categories['tourist-places']]);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      categories: Object.keys(categories)
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 