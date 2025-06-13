-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_track_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_track_id UUID REFERENCES workout_tracks(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paused_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_track_id)
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own track subscriptions" ON user_track_subscriptions;
DROP POLICY IF EXISTS "Users can create their own track subscriptions" ON user_track_subscriptions;
DROP POLICY IF EXISTS "Users can update their own track subscriptions" ON user_track_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own track subscriptions" ON user_track_subscriptions;

-- Ensure RLS is enabled
ALTER TABLE user_track_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create new policies with explicit checks
CREATE POLICY "Users can view their own track subscriptions" 
ON user_track_subscriptions
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own track subscriptions" 
ON user_track_subscriptions
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track subscriptions" 
ON user_track_subscriptions
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track subscriptions" 
ON user_track_subscriptions
FOR DELETE 
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON user_track_subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE user_track_subscriptions_id_seq TO authenticated; 