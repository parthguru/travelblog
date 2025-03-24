-- Create directory categories and listings tables if they don't exist

-- Create directory_categories table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'directory_categories') THEN
        CREATE TABLE directory_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(150) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_directory_categories_slug ON directory_categories(slug);
    END IF;
END $$;

-- Create directory_listings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'directory_listings') THEN
        CREATE TABLE directory_listings (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(300) UNIQUE NOT NULL,
            category_id INTEGER REFERENCES directory_categories(id),
            description TEXT,
            location VARCHAR(255),
            location_data JSONB,
            price_range VARCHAR(50),
            images JSONB,
            hours JSONB,
            website VARCHAR(255),
            phone VARCHAR(50),
            email VARCHAR(100),
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_directory_listings_slug ON directory_listings(slug);
        CREATE INDEX idx_directory_listings_category_id ON directory_listings(category_id);
        CREATE INDEX idx_directory_listings_featured ON directory_listings(featured);
    END IF;
END $$;

-- Insert initial categories if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM directory_categories LIMIT 1) THEN
        INSERT INTO directory_categories (name, slug, description)
        VALUES 
            ('Hotels', 'hotels', 'Places to stay during your visit'),
            ('Restaurants', 'restaurants', 'Places to eat and drink'),
            ('Attractions', 'attractions', 'Tourist attractions and points of interest'),
            ('Activities', 'activities', 'Things to do and experiences');
    END IF;
END $$; 