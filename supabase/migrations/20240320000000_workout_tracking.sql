-- Create workout tracks table
CREATE TABLE IF NOT EXISTS workout_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES workout_tracks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  session_type TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  duration_minutes INTEGER NOT NULL,
  intensity_level INTEGER NOT NULL CHECK (intensity_level BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout blocks table
CREATE TABLE IF NOT EXISTS workout_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest_time INTEGER NOT NULL,
  notes TEXT,
  demonstration_video TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create block exercises junction table
CREATE TABLE IF NOT EXISTS block_exercises (
  block_id UUID REFERENCES workout_blocks(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  PRIMARY KEY (block_id, exercise_id)
);

-- Create user track subscriptions table
CREATE TABLE IF NOT EXISTS user_track_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_track_id UUID REFERENCES workout_tracks(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, workout_track_id)
);

-- Create completed sessions table
CREATE TABLE IF NOT EXISTS completed_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  notes TEXT,
  performance_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout achievements table
CREATE TABLE IF NOT EXISTS workout_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_track_id ON workout_sessions(track_id);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_session_id ON workout_blocks(session_id);
CREATE INDEX IF NOT EXISTS idx_block_exercises_block_id ON block_exercises(block_id);
CREATE INDEX IF NOT EXISTS idx_block_exercises_exercise_id ON block_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_track_subscriptions_user_id ON user_track_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_track_subscriptions_track_id ON user_track_subscriptions(workout_track_id);
CREATE INDEX IF NOT EXISTS idx_completed_sessions_user_id ON completed_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_sessions_session_id ON completed_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_completed_sessions_completed_at ON completed_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_workout_achievements_user_id ON workout_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_achievements_workout_id ON workout_achievements(workout_id);

-- Create RLS policies
ALTER TABLE workout_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_track_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_achievements ENABLE ROW LEVEL SECURITY;

-- Workout tracks policies
CREATE POLICY "Workout tracks are viewable by everyone"
  ON workout_tracks FOR SELECT
  USING (true);

-- Workout sessions policies
CREATE POLICY "Workout sessions are viewable by everyone"
  ON workout_sessions FOR SELECT
  USING (true);

-- Workout blocks policies
CREATE POLICY "Workout blocks are viewable by everyone"
  ON workout_blocks FOR SELECT
  USING (true);

-- Exercises policies
CREATE POLICY "Exercises are viewable by everyone"
  ON exercises FOR SELECT
  USING (true);

-- Block exercises policies
CREATE POLICY "Block exercises are viewable by everyone"
  ON block_exercises FOR SELECT
  USING (true);

-- User track subscriptions policies
CREATE POLICY "Users can view their own track subscriptions"
  ON user_track_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own track subscriptions"
  ON user_track_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track subscriptions"
  ON user_track_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Completed sessions policies
CREATE POLICY "Users can view their own completed sessions"
  ON completed_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completed sessions"
  ON completed_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Workout achievements policies
CREATE POLICY "Users can view their own achievements"
  ON workout_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
  ON workout_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_workout_tracks_updated_at
  BEFORE UPDATE ON workout_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_blocks_updated_at
  BEFORE UPDATE ON workout_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_track_subscriptions_updated_at
  BEFORE UPDATE ON user_track_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completed_sessions_updated_at
  BEFORE UPDATE ON completed_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 