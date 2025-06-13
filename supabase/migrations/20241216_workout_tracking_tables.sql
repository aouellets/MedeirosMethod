-- Create workout session tracking table
CREATE TABLE IF NOT EXISTS workout_session_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  current_block INTEGER DEFAULT 0,
  current_exercise INTEGER DEFAULT 0,
  current_set INTEGER DEFAULT 1,
  exercises_completed INTEGER DEFAULT 0,
  sets_completed INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user workout statistics table
CREATE TABLE IF NOT EXISTS user_workout_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_workouts INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_workout_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additional columns to user_session_completions if they don't exist
DO $$ 
BEGIN
  -- Add duration_seconds column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_session_completions' 
                 AND column_name = 'duration_seconds') THEN
    ALTER TABLE user_session_completions ADD COLUMN duration_seconds INTEGER DEFAULT 0;
  END IF;

  -- Add exercises_completed column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_session_completions' 
                 AND column_name = 'exercises_completed') THEN
    ALTER TABLE user_session_completions ADD COLUMN exercises_completed INTEGER DEFAULT 0;
  END IF;

  -- Add sets_completed column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_session_completions' 
                 AND column_name = 'sets_completed') THEN
    ALTER TABLE user_session_completions ADD COLUMN sets_completed INTEGER DEFAULT 0;
  END IF;

  -- Add total_reps column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_session_completions' 
                 AND column_name = 'total_reps') THEN
    ALTER TABLE user_session_completions ADD COLUMN total_reps INTEGER DEFAULT 0;
  END IF;

  -- Add notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_session_completions' 
                 AND column_name = 'notes') THEN
    ALTER TABLE user_session_completions ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_session_tracking_user_id ON workout_session_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_tracking_session_id ON workout_session_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_tracking_status ON workout_session_tracking(status);
CREATE INDEX IF NOT EXISTS idx_workout_session_tracking_started_at ON workout_session_tracking(started_at);

CREATE INDEX IF NOT EXISTS idx_user_workout_stats_user_id ON user_workout_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_stats_last_workout_date ON user_workout_stats(last_workout_date);

-- Enable Row Level Security
ALTER TABLE workout_session_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workout_session_tracking
CREATE POLICY "Users can view their own workout session tracking" ON workout_session_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout session tracking" ON workout_session_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout session tracking" ON workout_session_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout session tracking" ON workout_session_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_workout_stats
CREATE POLICY "Users can view their own workout stats" ON user_workout_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout stats" ON user_workout_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout stats" ON user_workout_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout stats" ON user_workout_stats
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_workout_session_tracking_updated_at ON workout_session_tracking;
CREATE TRIGGER update_workout_session_tracking_updated_at
  BEFORE UPDATE ON workout_session_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_workout_stats_updated_at ON user_workout_stats;
CREATE TRIGGER update_user_workout_stats_updated_at
  BEFORE UPDATE ON user_workout_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 