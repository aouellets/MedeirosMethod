-- Add new columns to social_posts table
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sponsor_id TEXT,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_is_featured ON social_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_sponsored ON social_posts(is_sponsored);
CREATE INDEX IF NOT EXISTS idx_social_posts_engagement_score ON social_posts(engagement_score);

-- Create function to update engagement score
CREATE OR REPLACE FUNCTION update_post_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE social_posts
  SET engagement_score = (
    SELECT 
      COALESCE(COUNT(DISTINCT l.id), 0) * 1 + -- Likes count
      COALESCE(COUNT(DISTINCT c.id), 0) * 2 + -- Comments count (weighted more)
      COALESCE(COUNT(DISTINCT s.id), 0) * 3   -- Shares count (weighted most)
    FROM social_posts p
    LEFT JOIN social_likes l ON l.post_id = p.id
    LEFT JOIN social_comments c ON c.post_id = p.id
    LEFT JOIN social_shares s ON s.post_id = p.id
    WHERE p.id = NEW.post_id
    GROUP BY p.id
  )
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for engagement score updates
DROP TRIGGER IF EXISTS update_engagement_on_like ON social_likes;
CREATE TRIGGER update_engagement_on_like
  AFTER INSERT OR UPDATE OR DELETE ON social_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_score();

DROP TRIGGER IF EXISTS update_engagement_on_comment ON social_comments;
CREATE TRIGGER update_engagement_on_comment
  AFTER INSERT OR UPDATE OR DELETE ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_score();

DROP TRIGGER IF EXISTS update_engagement_on_share ON social_shares;
CREATE TRIGGER update_engagement_on_share
  AFTER INSERT OR UPDATE OR DELETE ON social_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_score();

-- Update existing posts with initial engagement scores
UPDATE social_posts p
SET engagement_score = (
  SELECT 
    COALESCE(COUNT(DISTINCT l.id), 0) * 1 +
    COALESCE(COUNT(DISTINCT c.id), 0) * 2 +
    COALESCE(COUNT(DISTINCT s.id), 0) * 3
  FROM social_posts
  LEFT JOIN social_likes l ON l.post_id = p.id
  LEFT JOIN social_comments c ON c.post_id = p.id
  LEFT JOIN social_shares s ON s.post_id = p.id
  WHERE social_posts.id = p.id
  GROUP BY social_posts.id
); 