-- Create the scalable workout database schema
-- This replaces the previous simpler schema with a more comprehensive approach

-- First, create the new tables before dropping the old ones to preserve data

-- Create movement_patterns table
CREATE TABLE IF NOT EXISTS movement_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert movement patterns
INSERT INTO movement_patterns (name, description) VALUES
  ('squat', 'Knee-dominant movement pattern'),
  ('hinge', 'Hip-dominant movement pattern'),
  ('press', 'Vertical or horizontal pushing movement'),
  ('pull', 'Vertical or horizontal pulling movement'),
  ('carry', 'Loaded carrying movement'),
  ('lunge', 'Single-leg knee-dominant movement'),
  ('rotation', 'Rotational or anti-rotational movement'),
  ('gait', 'Walking, running, or locomotion patterns')
ON CONFLICT (name) DO NOTHING;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('movement', 'stimulus', 'equipment', 'muscle_group', 'skill_level')),
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common tags
INSERT INTO tags (name, type) VALUES
  ('upper_body', 'muscle_group'),
  ('lower_body', 'muscle_group'),
  ('core', 'muscle_group'),
  ('full_body', 'muscle_group'),
  ('explosive', 'stimulus'),
  ('strength', 'stimulus'),
  ('endurance', 'stimulus'),
  ('power', 'stimulus'),
  ('mobility', 'stimulus'),
  ('unilateral', 'movement'),
  ('bilateral', 'movement'),
  ('compound', 'movement'),
  ('isolation', 'movement'),
  ('barbell', 'equipment'),
  ('dumbbell', 'equipment'),
  ('kettlebell', 'equipment'),
  ('bodyweight', 'equipment'),
  ('machine', 'equipment'),
  ('beginner', 'skill_level'),
  ('intermediate', 'skill_level'),
  ('advanced', 'skill_level')
ON CONFLICT (name) DO NOTHING;

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Olympic Lift, Gymnastics, Monostructural, etc.
  equipment TEXT[] DEFAULT '{}',
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  instructions JSONB DEFAULT '{}',
  video_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise_patterns junction table
CREATE TABLE IF NOT EXISTS exercise_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  pattern_id UUID REFERENCES movement_patterns(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exercise_id, pattern_id)
);

-- Create exercise_tags junction table
CREATE TABLE IF NOT EXISTS exercise_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exercise_id, tag_id)
);

-- Create exercise_variants table
CREATE TABLE IF NOT EXISTS exercise_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  relationship_type TEXT CHECK (relationship_type IN ('progression_of', 'variation_of', 'regression_of')) NOT NULL,
  difficulty_modifier INTEGER DEFAULT 0, -- -2 to +2, where negative is easier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scaling_options table
CREATE TABLE IF NOT EXISTS scaling_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  scaled_name TEXT NOT NULL,
  substitution_equipment TEXT[] DEFAULT '{}',
  notes TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('RX+', 'RX', 'Scaled', 'Beginner')) DEFAULT 'Scaled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_tracks table (if tracks doesn't exist)
CREATE TABLE IF NOT EXISTS workout_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  emoji TEXT,
  frequency_description TEXT,
  features TEXT[] DEFAULT '{}',
  suitable_for TEXT[] DEFAULT '{}',
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  days_per_week INTEGER,
  sessions_per_day INTEGER DEFAULT 1,
  goal_audience TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 8 programming tracks if they don't exist
INSERT INTO workout_tracks (name, slug, description, emoji, frequency_description, features, suitable_for, difficulty_level, display_order, days_per_week, sessions_per_day) VALUES
(
  'Medeiros Method', 
  'medeiros-method',
  'The foundation of a champion. The exact training system that shaped Justin into a multi-time CrossFit Games champion. This is functional fitness at its highest level — blending Olympic lifting, gymnastics, and high-intensity conditioning in a way that builds both capacity and confidence. Scalable for all levels, but built to win.',
  '🔥',
  '5–6 days/week',
  ARRAY['Strength Training', 'Metcon', 'Skill Work', 'Optional RX/Scaled/Competitor formats'],
  ARRAY['Intermediate+ CrossFitters', 'General athletes', 'Everyday fire-breathers'],
  4,
  1,
  6,
  1
),
(
  'Compete', 
  'compete',
  'Built for the arena. This is where champions sharpen their edge. Based on Justin''s own competition training, Compete is a high-volume track with multiple daily sessions, structured peaking cycles, and precision progressions. It''s for athletes aiming to qualify, podium, or peak.',
  '🏁',
  '6–7 days/week with AM/PM splits',
  ARRAY['Programmed by competitive season', 'Strength %', 'Gymnastics', 'Sprint intervals'],
  ARRAY['Advanced athletes', 'Quarterfinal+ hopefuls'],
  5,
  2,
  7,
  2
),
(
  'Conjugate Strength', 
  'conjugate-strength',
  'Westside grit meets modern performance. A powerlifting-based strength track that cycles max effort and dynamic effort sessions using the conjugate method. Perfect for athletes seeking raw strength, explosiveness, and structural balance — whether you compete or just want to be unreasonably strong.',
  '💪',
  '4 days/week',
  ARRAY['Rotating movement variations', 'Speed work', 'Bands, chains, GPP'],
  ARRAY['Lifters', 'Hybrid athletes', 'Off-season strength cycles'],
  4,
  3,
  4,
  1
),
(
  'Endure', 
  'endure',
  'Built for distance. Conditioned for life. Whether you''re training for a 5K, triathlon, or just want to build serious aerobic capacity, this track has you covered. Includes structured running, rowing, biking, and swimming — complete with pacing guidance and weekly long sessions.',
  '🏃',
  '3–6 days/week',
  ARRAY['Zone 2 work', 'Intervals', 'Tempo runs', 'Optional crossover with training/strength days'],
  ARRAY['Endurance athletes', 'Runners', 'Hybrid competitors'],
  3,
  4,
  5,
  1
),
(
  'Build (Hypertrophy / Aesthetic)', 
  'build',
  'Train hard. Look strong. A classic hypertrophy program based on Justin''s offseason training structure. Focuses on muscle growth, symmetry, and accessory strength while keeping function in mind. Great for aesthetic goals, joint health, or layering with conditioning.',
  '🏗️',
  '4–6 days/week',
  ARRAY['Push/Pull/Legs or Upper/Lower splits', 'Pump-focused accessory work'],
  ARRAY['Bodybuilders', 'Aesthetic-focused athletes', 'Offseason training'],
  3,
  5,
  5,
  1
),
(
  'Foundations', 
  'foundations',
  'Start here. Build forever. Designed for beginners, returners, or those new to CrossFit-style training. Foundations walks you through key movements, pacing strategies, and how to train safely while still getting after it. Less volume, more coaching, all progress.',
  '🧱',
  '3–5 days/week',
  ARRAY['Structured progressions', 'Movement library & video demos'],
  ARRAY['Beginners', 'New athletes', 'Return from injury'],
  2,
  6,
  4,
  1
),
(
  'Minimal Gear', 
  'minimal-gear',
  'No excuses. Just work. Whether you''re in a hotel, garage, park, or living room — this track delivers high-quality programming using only dumbbells, bodyweight, and a few basics. Maximum intensity, minimum equipment.',
  '🎒',
  '20–30 min workouts',
  ARRAY['EMOMs', 'AMRAPs', 'Interval formats', 'Dumbbell + bodyweight focused'],
  ARRAY['Travelers', 'Minimalists', 'At-home athletes'],
  3,
  7,
  5,
  1
),
(
  'Recover & Mobilize', 
  'recover-mobilize',
  'Move better. Recover faster. Daily mobility and movement prep sessions guided by trusted recovery partners. Designed to improve joint health, reduce soreness, and prep your body for high performance — or active recovery.',
  '🧘',
  '10–20 min sessions',
  ARRAY['Pre/post-workout flows', 'Targeted by movement pattern (e.g. squat, overhead)'],
  ARRAY['Everyone'],
  1,
  8,
  7,
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Update goal_audience column
UPDATE workout_tracks SET goal_audience = suitable_for WHERE goal_audience IS NULL;

-- Create sessions table (replaces workouts)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES workout_tracks(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7) NOT NULL,
  week_number INTEGER DEFAULT 1,
  session_type TEXT NOT NULL, -- Strength, Conditioning, Recovery, Skill, etc.
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  block_type TEXT NOT NULL, -- Warm-Up, Strength, Metcon, Cooldown, Skill, etc.
  name TEXT,
  description TEXT,
  sequence INTEGER NOT NULL,
  duration_minutes INTEGER,
  rest_minutes INTEGER,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create block_exercises table (replaces workout_exercises)
CREATE TABLE IF NOT EXISTS block_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID REFERENCES blocks(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  sequence INTEGER NOT NULL,
  sets INTEGER,
  reps TEXT, -- Can be "10", "10-12", "AMRAP", etc.
  duration_seconds INTEGER,
  distance_meters INTEGER,
  load_type TEXT CHECK (load_type IN ('fixed_weight', 'percentage', 'bodyweight', 'tempo', 'none')) DEFAULT 'none',
  load_value DECIMAL(6,2), -- Weight in kg or percentage
  target_metric TEXT CHECK (target_metric IN ('reps', 'time', 'distance', 'rounds', 'calories')) DEFAULT 'reps',
  rest_seconds INTEGER,
  tempo TEXT, -- e.g., "3-1-1-0"
  notes TEXT,
  scaling_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_track_subscriptions table if it doesn't exist
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

-- Create user_session_completions table (replaces user_workout_completions)
CREATE TABLE IF NOT EXISTS user_session_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  track_subscription_id UUID REFERENCES user_track_subscriptions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  notes TEXT,
  performance_data JSONB DEFAULT '{}', -- Times, weights, reps achieved per exercise
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  rx_level TEXT CHECK (rx_level IN ('RX+', 'RX', 'Scaled', 'Beginner')) DEFAULT 'RX',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop old tables after creating new structure
DROP TABLE IF EXISTS user_workout_completions CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_tracks_active ON workout_tracks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_skill_level ON exercises(skill_level);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_track_week ON sessions(track_id, week_number, day_of_week);
CREATE INDEX IF NOT EXISTS idx_sessions_published ON sessions(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blocks_session_sequence ON blocks(session_id, sequence);
CREATE INDEX IF NOT EXISTS idx_block_exercises_block_sequence ON block_exercises(block_id, sequence);
CREATE INDEX IF NOT EXISTS idx_user_session_completions_user_date ON user_session_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_patterns_exercise ON exercise_patterns(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_tags_exercise ON exercise_tags(exercise_id);
CREATE INDEX IF NOT EXISTS idx_scaling_options_exercise ON scaling_options(exercise_id);

-- Enable RLS on all new tables
ALTER TABLE movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE scaling_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_track_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to exercise library
CREATE POLICY "Anyone can view movement patterns" ON movement_patterns FOR SELECT USING (true);
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view active exercises" ON exercises FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view exercise patterns" ON exercise_patterns FOR SELECT USING (true);
CREATE POLICY "Anyone can view exercise tags" ON exercise_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view exercise variants" ON exercise_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can view scaling options" ON scaling_options FOR SELECT USING (true);

-- RLS Policies for sessions and blocks
CREATE POLICY "Anyone can view published sessions" ON sessions FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view blocks for published sessions" ON blocks FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_id AND s.is_published = true)
);
CREATE POLICY "Anyone can view block exercises for published sessions" ON block_exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM blocks b 
    JOIN sessions s ON s.id = b.session_id 
    WHERE b.id = block_id AND s.is_published = true
  )
);

-- RLS Policies for user completions
CREATE POLICY "Users can view their own session completions" ON user_session_completions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own session completions" ON user_session_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own session completions" ON user_session_completions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_track_subscriptions
CREATE POLICY "Users can view their own track subscriptions" ON user_track_subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own track subscriptions" ON user_track_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own track subscriptions" ON user_track_subscriptions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own track subscriptions" ON user_track_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- Admin policies (assuming admin role)
CREATE POLICY "Admins can manage all exercise data" ON exercises FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage sessions" ON sessions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage blocks" ON blocks FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage block exercises" ON block_exercises FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create updated_at triggers
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_tracks_updated_at
  BEFORE UPDATE ON workout_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_track_subscriptions_updated_at
  BEFORE UPDATE ON user_track_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 