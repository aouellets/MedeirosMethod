-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('workout-media', 'workout-media', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']),
  ('progress-photos', 'progress-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('social-posts', 'social-posts', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']),
  ('exercise-demos', 'exercise-demos', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage buckets

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

-- Create social features tables

-- Social posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}',
    workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    exercise_name TEXT,
    tags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_public ON public.social_posts(is_public);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view public posts"
    ON public.social_posts
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view their own posts"
    ON public.social_posts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
    ON public.social_posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON public.social_posts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON public.social_posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.social_posts TO authenticated;
GRANT USAGE ON SEQUENCE social_posts_id_seq TO authenticated;

-- Create likes table
CREATE TABLE IF NOT EXISTS public.social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Enable RLS on likes
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes
CREATE POLICY "Users can view likes on public posts"
    ON public.social_likes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.social_posts
            WHERE id = social_likes.post_id
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can like posts"
    ON public.social_likes
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.social_posts
            WHERE id = post_id
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can unlike their own likes"
    ON public.social_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.social_likes TO authenticated;
GRANT USAGE ON SEQUENCE social_likes_id_seq TO authenticated;

-- Create comments table
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on comments
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
CREATE POLICY "Users can view comments on public posts"
    ON public.social_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.social_posts
            WHERE id = social_comments.post_id
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can comment on posts"
    ON public.social_comments
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.social_posts
            WHERE id = post_id
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own comments"
    ON public.social_comments
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.social_comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.social_comments TO authenticated;
GRANT USAGE ON SEQUENCE social_comments_id_seq TO authenticated;

-- Create user follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Enable RLS on follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for follows
CREATE POLICY "Users can view follows"
    ON public.user_follows
    FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others"
    ON public.user_follows
    FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
    ON public.user_follows
    FOR DELETE
    USING (auth.uid() = follower_id);

-- Grant necessary permissions
GRANT ALL ON public.user_follows TO authenticated;
GRANT USAGE ON SEQUENCE user_follows_id_seq TO authenticated;

-- Progress photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  notes TEXT,
  measurements JSONB, -- Store body measurements
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout media table
CREATE TABLE IF NOT EXISTS workout_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID, -- Reference to workout if applicable
  exercise_name TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  duration_seconds INTEGER, -- For videos
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise demonstrations table
CREATE TABLE IF NOT EXISTS exercise_demonstrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_name TEXT NOT NULL,
  demonstration_type TEXT NOT NULL CHECK (demonstration_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  muscle_groups TEXT[] DEFAULT '{}',
  equipment_needed TEXT[] DEFAULT '{}',
  duration_seconds INTEGER, -- For videos
  created_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_media_user_id ON workout_media(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_demos_name ON exercise_demonstrations(exercise_name);

-- Enable RLS on all tables
ALTER TABLE workout_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_demonstrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_media
CREATE POLICY "Users can view public workout media or their own" ON workout_media
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own workout media" ON workout_media
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workout media" ON workout_media
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workout media" ON workout_media
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for exercise_demonstrations
CREATE POLICY "Users can view approved exercise demonstrations" ON exercise_demonstrations
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create exercise demonstrations" ON exercise_demonstrations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own exercise demonstrations" ON exercise_demonstrations
  FOR UPDATE USING (created_by = auth.uid());

-- Create functions to update counters
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON social_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON social_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_comments_updated_at
  BEFORE UPDATE ON social_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_photos_updated_at
  BEFORE UPDATE ON progress_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_media_updated_at
  BEFORE UPDATE ON workout_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_demonstrations_updated_at
  BEFORE UPDATE ON exercise_demonstrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON workout_media TO authenticated;
GRANT ALL ON exercise_demonstrations TO authenticated; 