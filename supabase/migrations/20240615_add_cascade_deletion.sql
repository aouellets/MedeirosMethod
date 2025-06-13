-- Migration: Add comprehensive cascade deletion for user data cleanup
-- This ensures that when a user is deleted from auth.users, all their related data is automatically cleaned up

-- First, let's create a function to handle user deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger AS $$
BEGIN
  -- Delete user's storage files (avatars, workout media, etc.)
  -- Note: This would need to be implemented with a storage trigger or edge function
  
  -- Log the deletion for audit purposes
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    old_data,
    created_at
  ) VALUES (
    'auth.users',
    'DELETE',
    OLD.id,
    row_to_json(OLD),
    now()
  ) ON CONFLICT DO NOTHING; -- In case audit_log table doesn't exist yet
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion logging
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Update existing tables to ensure CASCADE deletion
-- (Some of these tables might not exist yet, but this ensures they're properly configured when created)

-- Profiles table (already has CASCADE, but let's ensure it's correct)
ALTER TABLE IF EXISTS public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Training stats table
ALTER TABLE IF EXISTS public.training_stats 
  DROP CONSTRAINT IF EXISTS training_stats_user_id_fkey;
ALTER TABLE IF EXISTS public.training_stats 
  ADD CONSTRAINT training_stats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Workouts table (if it exists)
ALTER TABLE IF EXISTS public.workouts 
  DROP CONSTRAINT IF EXISTS workouts_user_id_fkey;
ALTER TABLE IF EXISTS public.workouts 
  ADD CONSTRAINT workouts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Workout sessions table (if it exists)
ALTER TABLE IF EXISTS public.workout_sessions 
  DROP CONSTRAINT IF EXISTS workout_sessions_user_id_fkey;
ALTER TABLE IF EXISTS public.workout_sessions 
  ADD CONSTRAINT workout_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Exercise logs table (if it exists)
ALTER TABLE IF EXISTS public.exercise_logs 
  DROP CONSTRAINT IF EXISTS exercise_logs_user_id_fkey;
ALTER TABLE IF EXISTS public.exercise_logs 
  ADD CONSTRAINT exercise_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Social posts table (if it exists)
ALTER TABLE IF EXISTS public.social_posts 
  DROP CONSTRAINT IF EXISTS social_posts_user_id_fkey;
ALTER TABLE IF EXISTS public.social_posts 
  ADD CONSTRAINT social_posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Social follows table (if it exists)
ALTER TABLE IF EXISTS public.social_follows 
  DROP CONSTRAINT IF EXISTS social_follows_follower_id_fkey;
ALTER TABLE IF EXISTS public.social_follows 
  ADD CONSTRAINT social_follows_follower_id_fkey 
  FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.social_follows 
  DROP CONSTRAINT IF EXISTS social_follows_following_id_fkey;
ALTER TABLE IF EXISTS public.social_follows 
  ADD CONSTRAINT social_follows_following_id_fkey 
  FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Social likes table (if it exists)
ALTER TABLE IF EXISTS public.social_likes 
  DROP CONSTRAINT IF EXISTS social_likes_user_id_fkey;
ALTER TABLE IF EXISTS public.social_likes 
  ADD CONSTRAINT social_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Social comments table (if it exists)
ALTER TABLE IF EXISTS public.social_comments 
  DROP CONSTRAINT IF EXISTS social_comments_user_id_fkey;
ALTER TABLE IF EXISTS public.social_comments 
  ADD CONSTRAINT social_comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Notifications table (if it exists)
ALTER TABLE IF EXISTS public.notifications 
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS public.notifications 
  ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- User settings table (if it exists)
ALTER TABLE IF EXISTS public.user_settings 
  DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE IF EXISTS public.user_settings 
  ADD CONSTRAINT user_settings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add RLS policies for deletion on all tables
-- These policies ensure users can only delete their own data
-- Only create policies for tables that exist

-- Function to safely create policies only if table exists
CREATE OR REPLACE FUNCTION create_deletion_policy_if_table_exists(
  table_name text,
  policy_name text,
  policy_condition text
) RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = create_deletion_policy_if_table_exists.table_name) THEN
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (%s)', policy_name, table_name, policy_condition);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create policies for existing tables
SELECT create_deletion_policy_if_table_exists('workouts', 'Users can delete own workouts', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('workout_sessions', 'Users can delete own workout sessions', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('exercise_logs', 'Users can delete own exercise logs', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('social_posts', 'Users can delete own social posts', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('social_follows', 'Users can delete own follows', 'auth.uid() = follower_id');
SELECT create_deletion_policy_if_table_exists('social_likes', 'Users can delete own likes', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('social_comments', 'Users can delete own comments', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('notifications', 'Users can delete own notifications', 'auth.uid() = user_id');
SELECT create_deletion_policy_if_table_exists('user_settings', 'Users can delete own settings', 'auth.uid() = user_id');

-- Drop the helper function
DROP FUNCTION create_deletion_policy_if_table_exists(text, text, text);

-- Create a function that can be called to manually clean up a user's data
-- This is useful for GDPR compliance or manual cleanup
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS boolean AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Only allow users to delete their own data, or allow service role
  IF current_user_id != target_user_id AND current_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Unauthorized: Can only delete your own data';
  END IF;
  
  -- Delete in reverse dependency order to avoid foreign key conflicts
  DELETE FROM public.social_comments WHERE user_id = target_user_id;
  DELETE FROM public.social_likes WHERE user_id = target_user_id;
  DELETE FROM public.social_follows WHERE follower_id = target_user_id OR following_id = target_user_id;
  DELETE FROM public.social_posts WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.exercise_logs WHERE user_id = target_user_id;
  DELETE FROM public.workout_sessions WHERE user_id = target_user_id;
  DELETE FROM public.workouts WHERE user_id = target_user_id;
  DELETE FROM public.user_settings WHERE user_id = target_user_id;
  DELETE FROM public.training_stats WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an audit log table for tracking deletions (optional but recommended)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow service role to read audit logs
CREATE POLICY "Service role can access audit logs" ON public.audit_log
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON FUNCTION public.delete_user_data(UUID) IS 'Manually delete all data for a specific user. Used for GDPR compliance and cleanup.';
COMMENT ON FUNCTION public.handle_user_deletion() IS 'Trigger function that logs user deletions and can handle cleanup tasks.';
COMMENT ON TABLE public.audit_log IS 'Audit trail for tracking data operations, especially deletions for compliance.'; 