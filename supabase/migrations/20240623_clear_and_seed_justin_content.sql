-- Clear out all existing social data
DELETE FROM social_likes;
DELETE FROM social_comments;
DELETE FROM social_shares;
DELETE FROM social_posts;

-- Ensure Justin Medeiros user exists (replace with actual UUID if needed)
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'justin@medeiros.com', NOW(), '{"full_name": "Justin Medeiros", "first_name": "Justin", "last_name": "Medeiros"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert new posts from Justin Medeiros
INSERT INTO social_posts (id, user_id, content, media_urls, hashtags, is_public, is_featured, created_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Snatch PR at the gym today! #snatch #crossfit', ARRAY['https://qgxqjqjqjqjqjqjqjqjq.supabase.co/storage/v1/object/public/social-posts/justin_snatch.jpg'], ARRAY['snatch','crossfit'], TRUE, TRUE, NOW()),
  ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Working on my squat depth. Progress every day.', ARRAY['https://qgxqjqjqjqjqjqjqjqjq.supabase.co/storage/v1/object/public/social-posts/justin_squat.jpg'], ARRAY['squat','training'], TRUE, FALSE, NOW()),
  ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Mobility is key for recovery. Don''t skip it!', ARRAY['https://qgxqjqjqjqjqjqjqjqjq.supabase.co/storage/v1/object/public/social-posts/justin_mobility.jpeg'], ARRAY['mobility','recovery'], TRUE, FALSE, NOW()),
  ('10000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Rope climbs for days! #gamesprep', ARRAY['https://qgxqjqjqjqjqjqjqjqjq.supabase.co/storage/v1/object/public/social-posts/justin_rope_climb.jpeg'], ARRAY['ropeclimb','gamesprep'], TRUE, TRUE, NOW()),
  ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'New YouTube video: Full training day breakdown! Watch here:', ARRAY['https://i.ytimg.com/vi/1234567890/maxresdefault.jpg','https://www.youtube.com/watch?v=1234567890'], ARRAY['youtube','training'], TRUE, FALSE, NOW());

-- Add some likes and comments for engagement
-- Create a few dummy users
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'fan1@example.com', NOW(), '{"full_name": "Ellie Turner"}', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'fan2@example.com', NOW(), '{"full_name": "Sponsor Rep"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Likes
INSERT INTO social_likes (user_id, post_id, created_at) 
VALUES
  ('22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000001', NOW()),
  ('33333333-3333-3333-3333-333333333333', '10000000-0000-0000-0000-000000000001', NOW()),
  ('22222222-2222-2222-2222-222222222222', '10000000-0000-0000-0000-000000000002', NOW()),
  ('33333333-3333-3333-3333-333333333333', '10000000-0000-0000-0000-000000000003', NOW())
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Comments
INSERT INTO social_comments (id, post_id, user_id, content, created_at) 
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Incredible lift, Justin!', NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'Rope climbs are brutal. Nice work!', NOW())
ON CONFLICT (id) DO NOTHING;

-- Update engagement scores if needed
UPDATE social_posts SET engagement_score = (
  SELECT COUNT(*) FROM social_likes WHERE social_likes.post_id = social_posts.id
) + (
  SELECT COUNT(*) FROM social_comments WHERE social_comments.post_id = social_posts.id
); 