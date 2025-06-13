#!/bin/bash

# Generate 8 Weeks of Programming for All Tracks
# Starting June 9, 2025 (Monday)

echo "🚀 GENERATING 8 WEEKS OF PROGRAMMING"
echo "====================================="
echo "📅 Start Date: June 9, 2025 (Monday)"
echo "📊 Duration: 8 weeks"
echo "🎯 Tracks: All 8 tracks"
echo ""

# Generate comprehensive programming directly via SQL
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOF'

-- Clear existing sessions for clean regeneration
DELETE FROM block_exercises;
DELETE FROM blocks;
DELETE FROM sessions;

-- Get track IDs
\set medeiros_id (SELECT id FROM workout_tracks WHERE slug = 'medeiros-method')
\set compete_id (SELECT id FROM workout_tracks WHERE slug = 'compete')
\set conjugate_id (SELECT id FROM workout_tracks WHERE slug = 'conjugate-strength')
\set endure_id (SELECT id FROM workout_tracks WHERE slug = 'endure')
\set build_id (SELECT id FROM workout_tracks WHERE slug = 'build')
\set foundations_id (SELECT id FROM workout_tracks WHERE slug = 'foundations')
\set minimal_id (SELECT id FROM workout_tracks WHERE slug = 'minimal-gear')
\set recover_id (SELECT id FROM workout_tracks WHERE slug = 'recover-mobilize')

-- Create base exercises if they don't exist
INSERT INTO exercises (name, category, equipment, skill_level, is_active) VALUES
('Back Squat', 'Olympic Lift', ARRAY['barbell'], 'Intermediate', true),
('Front Squat', 'Olympic Lift', ARRAY['barbell'], 'Intermediate', true),
('Deadlift', 'Olympic Lift', ARRAY['barbell'], 'Intermediate', true),
('Clean & Jerk', 'Olympic Lift', ARRAY['barbell'], 'Advanced', true),
('Snatch', 'Olympic Lift', ARRAY['barbell'], 'Advanced', true),
('Strict Press', 'Olympic Lift', ARRAY['barbell'], 'Beginner', true),
('Push Press', 'Olympic Lift', ARRAY['barbell'], 'Intermediate', true),
('Pull-ups', 'Gymnastics', ARRAY['bodyweight'], 'Intermediate', true),
('Push-ups', 'Gymnastics', ARRAY['bodyweight'], 'Beginner', true),
('Burpees', 'Gymnastics', ARRAY['bodyweight'], 'Beginner', true),
('Box Jumps', 'Gymnastics', ARRAY['box'], 'Beginner', true),
('Toes-to-Bar', 'Gymnastics', ARRAY['bodyweight'], 'Intermediate', true),
('Double Unders', 'Gymnastics', ARRAY['jump rope'], 'Intermediate', true),
('Rowing', 'Monostructural', ARRAY['rower'], 'Beginner', true),
('Running', 'Monostructural', ARRAY['none'], 'Beginner', true),
('Assault Bike', 'Monostructural', ARRAY['bike'], 'Beginner', true),
('Thrusters', 'Olympic Lift', ARRAY['barbell'], 'Intermediate', true),
('Wall Balls', 'Gymnastics', ARRAY['medicine ball'], 'Beginner', true),
('Kettlebell Swings', 'Olympic Lift', ARRAY['kettlebell'], 'Beginner', true),
('Dumbbell Press', 'Accessory', ARRAY['dumbbell'], 'Beginner', true)
ON CONFLICT (name) DO NOTHING;

EOF

echo "✅ Base exercises created"
echo ""

# Now generate sessions for each track
echo "🔥 Generating Medeiros Method (6 days/week)..."

psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOF'

-- MEDEIROS METHOD: 8 weeks of programming
DO $$
DECLARE
    track_id UUID;
    session_id UUID;
    block_id UUID;
    exercise_id UUID;
    week_num INTEGER;
    day_num INTEGER;
BEGIN
    -- Get track ID
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'medeiros-method';
    
    -- Generate 8 weeks
    FOR week_num IN 1..8 LOOP
        -- Monday: Strength + Metcon
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 1, week_num, 'Strength', 'Monday Strength', 'Back Squat + Mixed Modal', 60, 8, true)
        RETURNING id INTO session_id;
        
        -- Warm-up block
        INSERT INTO blocks (session_id, block_type, name, sequence, duration_minutes)
        VALUES (session_id, 'Warm-Up', 'General Warm-up', 1, 10)
        RETURNING id INTO block_id;
        
        -- Strength block
        INSERT INTO blocks (session_id, block_type, name, sequence, duration_minutes)
        VALUES (session_id, 'Strength', 'Back Squat', 2, 25)
        RETURNING id INTO block_id;
        
        SELECT id INTO exercise_id FROM exercises WHERE name = 'Back Squat';
        INSERT INTO block_exercises (block_id, exercise_id, sequence, sets, reps, load_type, load_value, rest_seconds)
        VALUES (block_id, exercise_id, 1, 5, '5', 'percentage', 75 + (week_num * 2), 180);
        
        -- Metcon block
        INSERT INTO blocks (session_id, block_type, name, sequence, duration_minutes)
        VALUES (session_id, 'Metcon', 'Mixed Modal', 3, 20)
        RETURNING id INTO block_id;
        
        -- Tuesday: Olympic Lifting
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 2, week_num, 'Olympic', 'Tuesday Olympic', 'Clean & Jerk Focus', 60, 7, true)
        RETURNING id INTO session_id;
        
        -- Wednesday: Gymnastics + Conditioning
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 3, week_num, 'Gymnastics', 'Wednesday Gymnastics', 'Pull-ups + Conditioning', 55, 8, true)
        RETURNING id INTO session_id;
        
        -- Thursday: Strength + Accessory
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 4, week_num, 'Strength', 'Thursday Strength', 'Deadlift + Accessory', 60, 7, true)
        RETURNING id INTO session_id;
        
        -- Friday: Mixed Modal
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 5, week_num, 'Conditioning', 'Friday Metcon', 'High Intensity Mixed Modal', 45, 9, true)
        RETURNING id INTO session_id;
        
        -- Saturday: Long Workout
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 6, week_num, 'Conditioning', 'Saturday Grind', 'Longer Time Domain', 50, 6, true)
        RETURNING id INTO session_id;
        
    END LOOP;
END $$;

EOF

echo "✅ Medeiros Method complete"

echo "🏁 Generating Compete (7 days/week)..."

psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOF'

-- COMPETE: 8 weeks of programming
DO $$
DECLARE
    track_id UUID;
    session_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'compete';
    
    FOR week_num IN 1..8 LOOP
        -- Monday AM: Strength
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 1, week_num, 'Strength', 'Monday AM Strength', 'Heavy Back Squat', 45, 9, true);
        
        -- Monday PM: Conditioning
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 1, week_num, 'Conditioning', 'Monday PM Metcon', 'Sprint Intervals', 30, 10, true);
        
        -- Tuesday: Olympic Lifting
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 2, week_num, 'Olympic', 'Tuesday Olympic', 'Snatch Complex', 60, 8, true);
        
        -- Wednesday: Gymnastics
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 3, week_num, 'Gymnastics', 'Wednesday Gymnastics', 'Muscle-up Development', 50, 7, true);
        
        -- Thursday: Mixed Modal
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 4, week_num, 'Conditioning', 'Thursday Metcon', 'Competition Simulation', 40, 10, true);
        
        -- Friday: Strength
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 5, week_num, 'Strength', 'Friday Strength', 'Clean & Jerk Max', 50, 9, true);
        
        -- Saturday: Long Workout
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 6, week_num, 'Conditioning', 'Saturday Grind', 'Endurance Test', 60, 8, true);
        
        -- Sunday: Recovery/Skills
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 7, week_num, 'Recovery', 'Sunday Recovery', 'Active Recovery + Skills', 40, 3, true);
        
    END LOOP;
END $$;

EOF

echo "✅ Compete complete"

echo "💪 Generating Conjugate Strength (4 days/week)..."

psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOF'

-- CONJUGATE STRENGTH: 8 weeks of programming
DO $$
DECLARE
    track_id UUID;
    session_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'conjugate-strength';
    
    FOR week_num IN 1..8 LOOP
        -- Monday: Max Effort Upper
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 1, week_num, 'Strength', 'Max Effort Upper', 'Heavy Press Variation', 60, 9, true);
        
        -- Tuesday: Max Effort Lower
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 2, week_num, 'Strength', 'Max Effort Lower', 'Heavy Squat/Deadlift', 60, 9, true);
        
        -- Thursday: Dynamic Effort Upper
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 4, week_num, 'Power', 'Dynamic Effort Upper', 'Speed Press Work', 50, 7, true);
        
        -- Friday: Dynamic Effort Lower
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES (track_id, 5, week_num, 'Power', 'Dynamic Effort Lower', 'Speed Squat Work', 50, 7, true);
        
    END LOOP;
END $$;

EOF

echo "✅ Conjugate Strength complete"

echo "🏃 Generating remaining tracks..."

# Generate the remaining tracks with similar patterns
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOF'

-- ENDURE: 8 weeks
DO $$
DECLARE
    track_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'endure';
    
    FOR week_num IN 1..8 LOOP
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES 
        (track_id, 1, week_num, 'Endurance', 'Monday Base', 'Aerobic Base Building', 45, 5, true),
        (track_id, 2, week_num, 'Intervals', 'Tuesday Intervals', 'VO2 Max Intervals', 40, 8, true),
        (track_id, 3, week_num, 'Recovery', 'Wednesday Recovery', 'Easy Pace Recovery', 30, 3, true),
        (track_id, 4, week_num, 'Tempo', 'Thursday Tempo', 'Lactate Threshold', 35, 7, true),
        (track_id, 6, week_num, 'Long', 'Saturday Long', 'Long Steady Distance', 60 + (week_num * 5), 6, true);
    END LOOP;
END $$;

-- BUILD: 8 weeks
DO $$
DECLARE
    track_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'build';
    
    FOR week_num IN 1..8 LOOP
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES 
        (track_id, 1, week_num, 'Push', 'Monday Push', 'Chest, Shoulders, Triceps', 50, 7, true),
        (track_id, 2, week_num, 'Pull', 'Tuesday Pull', 'Back, Biceps', 50, 7, true),
        (track_id, 3, week_num, 'Legs', 'Wednesday Legs', 'Quads, Glutes, Hamstrings', 55, 8, true),
        (track_id, 4, week_num, 'Push', 'Thursday Push', 'Chest, Shoulders, Triceps', 50, 7, true),
        (track_id, 5, week_num, 'Pull', 'Friday Pull', 'Back, Biceps', 50, 7, true);
    END LOOP;
END $$;

-- FOUNDATIONS: 8 weeks
DO $$
DECLARE
    track_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'foundations';
    
    FOR week_num IN 1..8 LOOP
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES 
        (track_id, 1, week_num, 'Fundamentals', 'Monday Basics', 'Movement Fundamentals', 40, 4, true),
        (track_id, 3, week_num, 'Strength', 'Wednesday Strength', 'Basic Strength Patterns', 45, 5, true),
        (track_id, 5, week_num, 'Conditioning', 'Friday Conditioning', 'Light Conditioning', 35, 6, true),
        (track_id, 6, week_num, 'Practice', 'Saturday Practice', 'Skill Practice', 30, 3, true);
    END LOOP;
END $$;

-- MINIMAL GEAR: 8 weeks
DO $$
DECLARE
    track_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'minimal-gear';
    
    FOR week_num IN 1..8 LOOP
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES 
        (track_id, 1, week_num, 'Bodyweight', 'Monday Bodyweight', 'No Equipment Needed', 30, 7, true),
        (track_id, 2, week_num, 'HIIT', 'Tuesday HIIT', 'High Intensity Intervals', 25, 9, true),
        (track_id, 3, week_num, 'Strength', 'Wednesday Strength', 'Bodyweight Strength', 35, 6, true),
        (track_id, 4, week_num, 'Cardio', 'Thursday Cardio', 'Cardio Blast', 30, 8, true),
        (track_id, 5, week_num, 'Full Body', 'Friday Full Body', 'Complete Workout', 40, 7, true);
    END LOOP;
END $$;

-- RECOVER & MOBILIZE: 8 weeks
DO $$
DECLARE
    track_id UUID;
    week_num INTEGER;
BEGIN
    SELECT id INTO track_id FROM workout_tracks WHERE slug = 'recover-mobilize';
    
    FOR week_num IN 1..8 LOOP
        INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, description, duration_minutes, intensity_level, is_published)
        VALUES 
        (track_id, 1, week_num, 'Mobility', 'Monday Mobility', 'Full Body Mobility', 20, 2, true),
        (track_id, 2, week_num, 'Recovery', 'Tuesday Recovery', 'Active Recovery', 15, 1, true),
        (track_id, 3, week_num, 'Mobility', 'Wednesday Mobility', 'Hip & Shoulder Focus', 20, 2, true),
        (track_id, 4, week_num, 'Recovery', 'Thursday Recovery', 'Gentle Movement', 15, 1, true),
        (track_id, 5, week_num, 'Mobility', 'Friday Mobility', 'Spine & Core', 20, 2, true),
        (track_id, 6, week_num, 'Recovery', 'Saturday Recovery', 'Restorative', 25, 1, true),
        (track_id, 7, week_num, 'Mobility', 'Sunday Mobility', 'Weekly Reset', 30, 2, true);
    END LOOP;
END $$;

EOF

echo "✅ All tracks complete"

# Get final count
echo ""
echo "📊 FINAL SUMMARY"
echo "=================="

psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -t -c "
SELECT 
    wt.name,
    COUNT(s.id) as sessions
FROM workout_tracks wt
LEFT JOIN sessions s ON s.track_id = wt.id
GROUP BY wt.name, wt.display_order
ORDER BY wt.display_order;
"

total_sessions=$(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -t -c "SELECT COUNT(*) FROM sessions;")

echo ""
echo "🎉 PROGRAMMING GENERATION COMPLETE!"
echo "====================================="
echo "✅ Total Sessions Created: $total_sessions"
echo "📅 Duration: 8 weeks (June 9 - August 3, 2025)"
echo "🎯 All 8 tracks populated with intelligent programming"
echo ""
echo "💡 Next: Test your app to see the new workouts!" 