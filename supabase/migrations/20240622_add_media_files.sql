-- Create a function to handle media uploads
CREATE OR REPLACE FUNCTION upload_media_to_storage()
RETURNS void AS $$
BEGIN
    -- Create the social-posts bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('social-posts', 'social-posts', true)
    ON CONFLICT (id) DO NOTHING;

    -- Set up storage policies
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'social-posts');

    CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'social-posts' AND
        auth.role() = 'authenticated'
    );
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT upload_media_to_storage();

-- Update the media URLs in social_posts to use Supabase storage
UPDATE social_posts
SET media_urls = CASE
    WHEN content LIKE '%Training day with the team%' THEN
        ARRAY['https://lvacourlbrjwlvioqrqc.supabase.co/storage/v1/object/public/social-posts/justin-training-1.jpg']
    WHEN content LIKE '%Recovery is just as important%' THEN
        ARRAY['https://lvacourlbrjwlvioqrqc.supabase.co/storage/v1/object/public/social-posts/justin-recovery.jpg']
    WHEN content LIKE '%New training vlog%' THEN
        ARRAY['https://lvacourlbrjwlvioqrqc.supabase.co/storage/v1/object/public/social-posts/justin-vlog-thumbnail.jpg']
    WHEN content LIKE '%partnership with @nobull%' THEN
        ARRAY['https://lvacourlbrjwlvioqrqc.supabase.co/storage/v1/object/public/social-posts/justin-nobull.jpg']
    WHEN content LIKE '%Fueling my workouts with @nutrex%' THEN
        ARRAY['https://lvacourlbrjwlvioqrqc.supabase.co/storage/v1/object/public/social-posts/justin-nutrex.jpg']
    ELSE media_urls
END; 