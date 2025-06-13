-- Create social_comments table
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing comments (anyone can view)
CREATE POLICY "Anyone can view comments"
    ON public.social_comments
    FOR SELECT
    USING (true);

-- Policy for inserting comments (authenticated users only)
CREATE POLICY "Authenticated users can comment on posts"
    ON public.social_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for updating comments (only the user who created the comment)
CREATE POLICY "Users can update their own comments"
    ON public.social_comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for deleting comments (only the user who created the comment)
CREATE POLICY "Users can delete their own comments"
    ON public.social_comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS social_comments_user_id_idx ON public.social_comments(user_id);
CREATE INDEX IF NOT EXISTS social_comments_post_id_idx ON public.social_comments(post_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_social_comments_updated_at
    BEFORE UPDATE ON public.social_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema'; 