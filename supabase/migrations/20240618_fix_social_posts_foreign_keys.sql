-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.social_posts 
  DROP CONSTRAINT IF EXISTS social_posts_user_id_fkey;

-- Add foreign key to auth.users
ALTER TABLE public.social_posts
  ADD CONSTRAINT social_posts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.social_likes 
  DROP CONSTRAINT IF EXISTS social_likes_user_id_fkey;

-- Add foreign key to auth.users for likes
ALTER TABLE public.social_likes
  ADD CONSTRAINT social_likes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.social_comments 
  DROP CONSTRAINT IF EXISTS social_comments_user_id_fkey;

-- Add foreign key to auth.users for comments
ALTER TABLE public.social_comments
  ADD CONSTRAINT social_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 