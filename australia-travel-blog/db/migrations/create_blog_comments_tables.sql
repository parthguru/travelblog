-- Create blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  parent_id TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT fk_parent_comment
    FOREIGN KEY (parent_id)
    REFERENCES blog_comments (id)
    ON DELETE CASCADE
);

-- Create comment reports table
CREATE TABLE IF NOT EXISTS comment_reports (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'reviewed', 'rejected'
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_reported_comment
    FOREIGN KEY (comment_id)
    REFERENCES blog_comments (id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports (comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports (status); 