-- Create social_posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    media_urls TEXT[],
    hashtags TEXT[],
    location JSONB,
    is_public BOOLEAN DEFAULT true,
    reply_to_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    sponsor_id TEXT,
    featured_until TIMESTAMPTZ,
    engagement_score INTEGER DEFAULT 0
);

-- Create social_likes table
CREATE TABLE IF NOT EXISTS public.social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Create social_comments table
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS public.social_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Add RLS policies
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

-- Social posts policies
CREATE POLICY "Public posts are viewable by everyone"
    ON public.social_posts FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view their own posts"
    ON public.social_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts"
    ON public.social_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON public.social_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON public.social_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Social likes policies
CREATE POLICY "Anyone can view likes"
    ON public.social_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can like posts"
    ON public.social_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
    ON public.social_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Social comments policies
CREATE POLICY "Anyone can view comments"
    ON public.social_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can comment"
    ON public.social_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.social_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.social_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Social shares policies
CREATE POLICY "Anyone can view shares"
    ON public.social_shares FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can share posts"
    ON public.social_shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unshare their own shares"
    ON public.social_shares FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_likes_post_id ON public.social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_post_id ON public.social_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_featured ON public.social_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_sponsored ON public.social_posts(is_sponsored);
CREATE INDEX IF NOT EXISTS idx_social_posts_engagement_score ON public.social_posts(engagement_score);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_social_posts_updated_at
    BEFORE UPDATE ON public.social_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_social_comments_updated_at
    BEFORE UPDATE ON public.social_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update engagement score
CREATE OR REPLACE FUNCTION update_post_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE social_posts
    SET engagement_score = (
        COALESCE(likes_count, 0) * 1 +
        COALESCE(comments_count, 0) * 2 +
        COALESCE(shares_count, 0) * 3
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engagement score
CREATE TRIGGER update_post_engagement_score
    AFTER INSERT OR UPDATE OR DELETE ON social_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement_score();

CREATE TRIGGER update_post_engagement_score_comments
    AFTER INSERT OR UPDATE OR DELETE ON social_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement_score();

CREATE TRIGGER update_post_engagement_score_shares
    AFTER INSERT OR UPDATE OR DELETE ON social_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement_score();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema'; 