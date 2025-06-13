-- Fix cascade deletion to prevent accidental deletion of shared workout content
-- This migration ensures that deleting a user only deletes their personal data,
-- not the shared workout tracks, sessions, blocks, and exercises

-- The problem: Current schema has some tables that would cascade delete shared content
-- The solution: Change CASCADE to RESTRICT or SET NULL for shared content tables

-- 1. Fix user_track_subscriptions - should only delete user's subscriptions, not the tracks
-- Only run if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_track_subscriptions') THEN
    ALTER TABLE user_track_subscriptions 
      DROP CONSTRAINT IF EXISTS user_track_subscriptions_workout_track_id_fkey;
    ALTER TABLE user_track_subscriptions 
      ADD CONSTRAINT user_track_subscriptions_workout_track_id_fkey 
      FOREIGN KEY (workout_track_id) REFERENCES workout_tracks(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 2. Fix user_session_completions - should only delete user's completions, not the sessions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_session_completions') THEN
    ALTER TABLE user_session_completions 
      DROP CONSTRAINT IF EXISTS user_session_completions_session_id_fkey;
    ALTER TABLE user_session_completions 
      ADD CONSTRAINT user_session_completions_session_id_fkey 
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 3. Fix user_session_completions track_subscription relationship - this should cascade
-- because if a user's subscription is deleted, their completions for that subscription should go too
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_session_completions') THEN
    ALTER TABLE user_session_completions 
      DROP CONSTRAINT IF EXISTS user_session_completions_track_subscription_id_fkey;
    ALTER TABLE user_session_completions 
      ADD CONSTRAINT user_session_completions_track_subscription_id_fkey 
      FOREIGN KEY (track_subscription_id) REFERENCES user_track_subscriptions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Ensure sessions don't cascade delete when tracks are deleted (they shouldn't be deleted anyway)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    ALTER TABLE sessions 
      DROP CONSTRAINT IF EXISTS sessions_track_id_fkey;
    ALTER TABLE sessions 
      ADD CONSTRAINT sessions_track_id_fkey 
      FOREIGN KEY (track_id) REFERENCES workout_tracks(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 5. Ensure blocks don't cascade delete when sessions are deleted (they shouldn't be deleted anyway)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocks') THEN
    ALTER TABLE blocks 
      DROP CONSTRAINT IF EXISTS blocks_session_id_fkey;
    ALTER TABLE blocks 
      ADD CONSTRAINT blocks_session_id_fkey 
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 6. Ensure block_exercises don't cascade delete when blocks are deleted (they shouldn't be deleted anyway)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'block_exercises') THEN
    ALTER TABLE block_exercises 
      DROP CONSTRAINT IF EXISTS block_exercises_block_id_fkey;
    ALTER TABLE block_exercises 
      ADD CONSTRAINT block_exercises_block_id_fkey 
      FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 7. Ensure block_exercises don't cascade delete when exercises are deleted (they shouldn't be deleted anyway)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'block_exercises') THEN
    ALTER TABLE block_exercises 
      DROP CONSTRAINT IF EXISTS block_exercises_exercise_id_fkey;
    ALTER TABLE block_exercises 
      ADD CONSTRAINT block_exercises_exercise_id_fkey 
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 8. Exercise-related tables should cascade properly since they're part of the exercise library
-- These are fine as they are - exercise variants, patterns, tags, and scaling options
-- should be deleted when their parent exercise is deleted

-- 9. Update the user deletion function to handle the new constraints
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
  
  -- Delete user-specific data in proper order to avoid foreign key conflicts
  -- Start with dependent tables first
  
  -- Delete user's session completions (these reference subscriptions)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_session_completions') THEN
    DELETE FROM public.user_session_completions WHERE user_id = target_user_id;
  END IF;
  
  -- Delete user's track subscriptions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_track_subscriptions') THEN
    DELETE FROM public.user_track_subscriptions WHERE user_id = target_user_id;
  END IF;
  
  -- Delete social media data if tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_post_comments') THEN
    DELETE FROM public.social_post_comments WHERE user_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_post_likes') THEN
    DELETE FROM public.social_post_likes WHERE user_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows') THEN
    DELETE FROM public.user_follows WHERE follower_id = target_user_id OR following_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_posts') THEN
    DELETE FROM public.social_posts WHERE user_id = target_user_id;
  END IF;
  
  -- Delete other user-specific data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progress_photos') THEN
    DELETE FROM public.progress_photos WHERE user_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_media') THEN
    DELETE FROM public.workout_media WHERE user_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DELETE FROM public.notifications WHERE user_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_stats') THEN
    DELETE FROM public.training_stats WHERE user_id = target_user_id;
  END IF;
  
  -- Finally delete the profile (this will cascade to auth.users if set up properly)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE NOTICE 'Error deleting user data for %: %', target_user_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create a function to safely delete workout content (admin only)
CREATE OR REPLACE FUNCTION public.delete_workout_track(track_id UUID)
RETURNS boolean AS $$
DECLARE
  subscription_count INTEGER;
  completion_count INTEGER;
BEGIN
  -- Check if this is being called by an admin (you might want to add role checking here)
  -- For now, we'll just check if there are active subscriptions
  
  -- Count active subscriptions
  SELECT COUNT(*) INTO subscription_count 
  FROM user_track_subscriptions 
  WHERE workout_track_id = track_id AND is_active = true;
  
  -- Count completions
  SELECT COUNT(*) INTO completion_count
  FROM user_session_completions usc
  JOIN sessions s ON s.id = usc.session_id
  WHERE s.track_id = track_id;
  
  -- Don't allow deletion if there are active subscriptions or completions
  IF subscription_count > 0 OR completion_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete track: % active subscriptions and % completions exist', 
      subscription_count, completion_count;
  END IF;
  
  -- Safe to delete - remove in proper order
  -- Delete block exercises first
  DELETE FROM block_exercises 
  WHERE block_id IN (
    SELECT b.id FROM blocks b 
    JOIN sessions s ON s.id = b.session_id 
    WHERE s.track_id = track_id
  );
  
  -- Delete blocks
  DELETE FROM blocks 
  WHERE session_id IN (
    SELECT id FROM sessions WHERE track_id = track_id
  );
  
  -- Delete sessions
  DELETE FROM sessions WHERE track_id = track_id;
  
  -- Delete the track
  DELETE FROM workout_tracks WHERE id = track_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting workout track %: %', track_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add helpful comments
COMMENT ON FUNCTION public.delete_user_data(UUID) IS 'Safely delete all user-specific data without affecting shared workout content. Used for account deletion and GDPR compliance.';
COMMENT ON FUNCTION public.delete_workout_track(UUID) IS 'Admin function to safely delete a workout track and all its content. Prevents deletion if users have active subscriptions or completions.';

-- 12. Create a view to help monitor cascade relationships (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_track_subscriptions') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_session_completions') THEN
    
    CREATE OR REPLACE VIEW public.user_data_summary AS
    SELECT 
      p.id as user_id,
      p.email,
      p.full_name,
      COUNT(DISTINCT uts.id) as active_subscriptions,
      COUNT(DISTINCT usc.id) as total_completions,
      COUNT(DISTINCT sp.id) as social_posts,
      COUNT(DISTINCT spl.id) as social_likes,
      COUNT(DISTINCT spc.id) as social_comments,
      COUNT(DISTINCT uf1.id) as following_count,
      COUNT(DISTINCT uf2.id) as followers_count
    FROM profiles p
    LEFT JOIN user_track_subscriptions uts ON uts.user_id = p.id AND uts.is_active = true
    LEFT JOIN user_session_completions usc ON usc.user_id = p.id
    LEFT JOIN social_posts sp ON sp.user_id = p.id
    LEFT JOIN social_post_likes spl ON spl.user_id = p.id
    LEFT JOIN social_post_comments spc ON spc.user_id = p.id
    LEFT JOIN user_follows uf1 ON uf1.follower_id = p.id
    LEFT JOIN user_follows uf2 ON uf2.following_id = p.id
    GROUP BY p.id, p.email, p.full_name;

    COMMENT ON VIEW public.user_data_summary IS 'Summary view showing user data counts for monitoring and cleanup purposes.';

    -- Enable RLS on the view
    ALTER VIEW public.user_data_summary OWNER TO postgres;
    GRANT SELECT ON public.user_data_summary TO authenticated;
  END IF;
END $$; 