-- Add hashtags column if it doesn't exist
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';

-- Insert featured content from Justin's social media
INSERT INTO social_posts (
    user_id,
    content,
    media_urls,
    hashtags,
    is_featured,
    is_sponsored,
    sponsor_id,
    featured_until,
    created_at
) VALUES
-- Justin's Instagram content
(
    'dfe10f0d-b60b-477f-848b-a89f33d86906', -- Justin's user ID
    'Training day with the team! 💪 Working on some new movements for the upcoming season. #CrossFit #Training #Fitness',
    ARRAY['https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123456_123456789012345_1234567890123456789_n.jpg'],
    ARRAY['crossfit', 'training', 'fitness'],
    true,
    false,
    null,
    NOW() + INTERVAL '30 days',
    NOW()
),
(
    'dfe10f0d-b60b-477f-848b-a89f33d86906',
    'Recovery is just as important as training. Taking care of the body with some mobility work and proper nutrition. #Recovery #CrossFit #Health',
    ARRAY['https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123457_123456789012346_1234567890123456790_n.jpg'],
    ARRAY['recovery', 'crossfit', 'health'],
    true,
    false,
    null,
    NOW() + INTERVAL '30 days',
    NOW()
),
-- YouTube content
(
    'dfe10f0d-b60b-477f-848b-a89f33d86906',
    'New training vlog is up! Check out my latest workout routine and some behind-the-scenes footage from the gym. Link in bio! #TrainingVlog #CrossFit #BehindTheScenes',
    ARRAY['https://i.ytimg.com/vi/1234567890/maxresdefault.jpg'],
    ARRAY['trainingvlog', 'crossfit', 'behindthescenes'],
    true,
    false,
    null,
    NOW() + INTERVAL '30 days',
    NOW()
),
-- Sponsored content
(
    'dfe10f0d-b60b-477f-848b-a89f33d86906',
    'Excited to announce my partnership with @nobull! Their gear has been essential to my training. Use code JUSTIN for 10% off your first order! #NoBull #Training #Partnership',
    ARRAY['https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123458_123456789012347_1234567890123456791_n.jpg'],
    ARRAY['nobull', 'training', 'partnership'],
    true,
    true,
    'NOBULL',
    NOW() + INTERVAL '30 days',
    NOW()
),
(
    'dfe10f0d-b60b-477f-848b-a89f33d86906',
    'Fueling my workouts with @nutrex! Their supplements have been game-changing for my performance. Check out my favorite products in the link below. #Nutrex #Supplements #Performance',
    ARRAY['https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123459_123456789012348_1234567890123456792_n.jpg'],
    ARRAY['nutrex', 'supplements', 'performance'],
    true,
    true,
    'NUTREX',
    NOW() + INTERVAL '30 days',
    NOW()
);

-- Add some engagement to make the content more realistic
-- First, create some additional users for likes
INSERT INTO auth.users (id, email, created_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'user1@example.com', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'user2@example.com', NOW()),
    ('33333333-3333-3333-3333-333333333333', 'user3@example.com', NOW()),
    ('44444444-4444-4444-4444-444444444444', 'user4@example.com', NOW()),
    ('55555555-5555-5555-5555-555555555555', 'user5@example.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add likes from different users
INSERT INTO social_likes (post_id, user_id, created_at)
SELECT 
    p.id,
    u.id,
    NOW() - (random() * interval '7 days')
FROM social_posts p
CROSS JOIN (
    SELECT id FROM auth.users 
    WHERE id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    )
) u
WHERE p.is_featured = true
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Add comments
INSERT INTO social_comments (post_id, user_id, content, created_at)
VALUES
(
    (SELECT id FROM social_posts WHERE content LIKE '%Training day with the team%' LIMIT 1),
    '11111111-1111-1111-1111-111111111111',
    'Looking strong! 💪 What''s your favorite movement to train?',
    NOW() - interval '2 days'
),
(
    (SELECT id FROM social_posts WHERE content LIKE '%Recovery is just as important%' LIMIT 1),
    '22222222-2222-2222-2222-222222222222',
    'Recovery is key! What''s your go-to recovery routine?',
    NOW() - interval '1 day'
),
(
    (SELECT id FROM social_posts WHERE content LIKE '%New training vlog%' LIMIT 1),
    '33333333-3333-3333-3333-333333333333',
    'Great content! Can''t wait for the next one!',
    NOW() - interval '3 days'
);

-- Update engagement scores for all posts
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