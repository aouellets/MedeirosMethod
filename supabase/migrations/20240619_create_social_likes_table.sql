-- Create social_likes table
CREATE TABLE IF NOT EXISTS public.social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, post_id)
);

-- Add RLS policies
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;

-- Policy for viewing likes (anyone can view)
CREATE POLICY "Anyone can view likes"
    ON public.social_likes
    FOR SELECT
    USING (true);

-- Policy for inserting likes (authenticated users only)
CREATE POLICY "Authenticated users can like posts"
    ON public.social_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for deleting likes (only the user who created the like)
CREATE POLICY "Users can unlike their own likes"
    ON public.social_likes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS social_likes_user_id_idx ON public.social_likes(user_id);
CREATE INDEX IF NOT EXISTS social_likes_post_id_idx ON public.social_likes(post_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema'; 