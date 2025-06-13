-- Create storage buckets manually that are failing due to security policy restrictions
-- These buckets are needed for the app to function properly

-- Create the buckets with the exact configuration from the original migration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('workout-media', 'workout-media', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']),
  ('progress-photos', 'progress-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('social-posts', 'social-posts', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']),
  ('exercise-demos', 'exercise-demos', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies to avoid conflicts (use IF EXISTS to prevent errors)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can upload their own avatar" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can update their own avatar" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can delete their own avatar" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Anyone can view avatars" ON storage.objects;
  END IF;
  
  -- Continue with other policies...
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own workout media' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can upload their own workout media" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own workout media' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can view their own workout media" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own workout media' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can delete their own workout media" ON storage.objects;
  END IF;
  
  -- Progress photos policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own progress photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can upload their own progress photos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own progress photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can view their own progress photos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own progress photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can delete their own progress photos" ON storage.objects;
  END IF;
  
  -- Social posts policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own social media' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can upload their own social media" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own social media' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can view their own social media" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own social media' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can delete their own social media" ON storage.objects;
  END IF;
  
  -- Exercise demos policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view exercise demos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Anyone can view exercise demos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload exercise demos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Admins can upload exercise demos" ON storage.objects;
  END IF;
  
  -- Thumbnails policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view thumbnails' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Anyone can view thumbnails" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload thumbnails' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can upload thumbnails" ON storage.objects;
  END IF;
END $$;

-- Create new storage policies

-- Avatars bucket policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Workout media bucket policies
CREATE POLICY "Users can upload their own workout media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'workout-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own workout media" ON storage.objects
  FOR SELECT USING (bucket_id = 'workout-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own workout media" ON storage.objects
  FOR DELETE USING (bucket_id = 'workout-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Progress photos bucket policies
CREATE POLICY "Users can upload their own progress photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own progress photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Social posts bucket policies
CREATE POLICY "Users can upload their own social media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own social media" ON storage.objects
  FOR SELECT USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own social media" ON storage.objects
  FOR DELETE USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Exercise demos bucket policies (public)
CREATE POLICY "Anyone can view exercise demos" ON storage.objects
  FOR SELECT USING (bucket_id = 'exercise-demos');

CREATE POLICY "Admins can upload exercise demos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'exercise-demos' AND auth.jwt() ->> 'role' = 'admin');

-- Thumbnails bucket policies (public)
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'thumbnails');
