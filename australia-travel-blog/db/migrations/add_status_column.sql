-- Add status column to blog_posts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'status'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        
        -- Create an index on the new column
        CREATE INDEX idx_blog_posts_status ON blog_posts(status);
    END IF;
END $$; 