# Scalable Workout Database Schema

## Overview

The Justin Medeiros App now implements a sophisticated, scalable workout database schema that supports comprehensive exercise libraries, structured workout programming, movement pattern classification, exercise scaling, and advanced tagging systems.

## Core Entity-Relationship Design

### 1. Workout Tracks (`workout_tracks`)
**The foundation of programming tracks**

```sql
workout_tracks:
- id (UUID, Primary Key)
- name (TEXT, Unique)
- slug (TEXT, Unique) 
- description (TEXT)
- emoji (TEXT)
- frequency_description (TEXT)
- features (TEXT[])
- suitable_for (TEXT[])
- difficulty_level (INTEGER, 1-5)
- days_per_week (INTEGER)
- sessions_per_day (INTEGER)
- goal_audience (TEXT[])
- is_active (BOOLEAN)
- display_order (INTEGER)
```

### 2. Sessions (`sessions`)
**Individual training sessions within tracks**

```sql
sessions:
- id (UUID, Primary Key)
- track_id (UUID, FK → workout_tracks.id)
- day_of_week (INTEGER, 1-7)
- week_number (INTEGER)
- session_type (TEXT) -- Strength, Conditioning, Recovery, Skill
- name (TEXT)
- description (TEXT)
- duration_minutes (INTEGER)
- intensity_level (INTEGER, 1-10)
- is_published (BOOLEAN)
```

### 3. Blocks (`blocks`)
**Structured workout sections (Warm-up, Strength, Metcon, etc.)**

```sql
blocks:
- id (UUID, Primary Key)
- session_id (UUID, FK → sessions.id)
- block_type (TEXT) -- Warm-Up, Strength, Metcon, Cooldown, Skill
- name (TEXT)
- description (TEXT)
- sequence (INTEGER)
- duration_minutes (INTEGER)
- rest_minutes (INTEGER)
- instructions (TEXT)
```

### 4. Exercises (`exercises`)
**Comprehensive exercise library**

```sql
exercises:
- id (UUID, Primary Key)
- name (TEXT)
- description (TEXT)
- category (TEXT) -- Olympic Lift, Gymnastics, Monostructural
- equipment (TEXT[])
- skill_level (TEXT) -- Beginner, Intermediate, Advanced
- instructions (JSONB)
- video_url (TEXT)
- image_url (TEXT)
- is_active (BOOLEAN)
```

### 5. Exercise Variants (`exercise_variants`)
**Exercise progressions and variations**

```sql
exercise_variants:
- id (UUID, Primary Key)
- base_exercise_id (UUID, FK → exercises.id)
- name (TEXT)
- description (TEXT)
- relationship_type (TEXT) -- progression_of, variation_of, regression_of
- difficulty_modifier (INTEGER, -2 to +2)
```

### 6. Block Exercises (`block_exercises`)
**Detailed exercise programming within blocks**

```sql
block_exercises:
- id (UUID, Primary Key)
- block_id (UUID, FK → blocks.id)
- exercise_id (UUID, FK → exercises.id)
- sequence (INTEGER)
- sets (INTEGER)
- reps (TEXT) -- "10", "10-12", "AMRAP"
- duration_seconds (INTEGER)
- distance_meters (INTEGER)
- load_type (TEXT) -- fixed_weight, percentage, bodyweight, tempo
- load_value (DECIMAL)
- target_metric (TEXT) -- reps, time, distance, rounds, calories
- rest_seconds (INTEGER)
- tempo (TEXT) -- "3-1-1-0"
- notes (TEXT)
- scaling_notes (TEXT)
```

### 7. Scaling Options (`scaling_options`)
**Exercise scaling and substitutions**

```sql
scaling_options:
- id (UUID, Primary Key)
- exercise_id (UUID, FK → exercises.id)
- scaled_name (TEXT)
- substitution_equipment (TEXT[])
- notes (TEXT)
- difficulty_level (TEXT) -- RX+, RX, Scaled, Beginner
```

### 8. Tags (`tags`)
**Flexible tagging system**

```sql
tags:
- id (UUID, Primary Key)
- name (TEXT, Unique)
- type (TEXT) -- movement, stimulus, equipment, muscle_group, skill_level
- color (TEXT)
```

### 9. Exercise Tags (`exercise_tags`)
**Many-to-many: exercises ↔ tags**

```sql
exercise_tags:
- exercise_id (UUID, FK → exercises.id)
- tag_id (UUID, FK → tags.id)
```

### 10. Movement Patterns (`movement_patterns`)
**Movement pattern classification**

```sql
movement_patterns:
- id (UUID, Primary Key)
- name (TEXT, Unique) -- squat, hinge, press, pull, carry, lunge, rotation, gait
- description (TEXT)
```

### 11. Exercise Patterns (`exercise_patterns`)
**Many-to-many: exercises ↔ movement patterns**

```sql
exercise_patterns:
- exercise_id (UUID, FK → exercises.id)
- pattern_id (UUID, FK → movement_patterns.id)
- is_primary (BOOLEAN)
```

## User Interaction Tables

### User Track Subscriptions (`user_track_subscriptions`)
**User subscriptions to workout tracks**

```sql
user_track_subscriptions:
- id (UUID, Primary Key)
- user_id (UUID, FK → auth.users.id)
- workout_track_id (UUID, FK → workout_tracks.id)
- is_active (BOOLEAN)
- started_at (TIMESTAMP)
- paused_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- current_week (INTEGER)
- current_day (INTEGER)
- preferences (JSONB) -- Track-specific settings like RX/Scaled
```

### User Session Completions (`user_session_completions`)
**User workout session completions**

```sql
user_session_completions:
- id (UUID, Primary Key)
- user_id (UUID, FK → auth.users.id)
- session_id (UUID, FK → sessions.id)
- track_subscription_id (UUID, FK → user_track_subscriptions.id)
- completed_at (TIMESTAMP)
- duration_minutes (INTEGER)
- notes (TEXT)
- performance_data (JSONB) -- Exercise-specific performance
- difficulty_rating (INTEGER, 1-5)
- enjoyment_rating (INTEGER, 1-5)
- rx_level (TEXT) -- RX+, RX, Scaled, Beginner
```

## Key Features & Benefits

### 1. **Hierarchical Workout Structure**
```
Workout Track
├── Sessions (by week/day)
│   ├── Blocks (Warm-up, Strength, Metcon, etc.)
│   │   ├── Block Exercises (specific programming)
│   │   │   ├── Exercise (from library)
│   │   │   ├── Scaling Options
│   │   │   └── Performance Tracking
```

### 2. **Comprehensive Exercise Library**
- **Categorization**: Olympic Lifts, Gymnastics, Monostructural, etc.
- **Movement Patterns**: Squat, Hinge, Press, Pull, Carry, Lunge, Rotation, Gait
- **Skill Levels**: Beginner, Intermediate, Advanced
- **Equipment Tracking**: Barbell, Dumbbell, Kettlebell, Bodyweight, etc.
- **Media Support**: Video URLs, images, detailed instructions

### 3. **Advanced Programming Features**
- **Multiple Load Types**: Fixed weight, percentage-based, bodyweight, tempo
- **Flexible Rep Schemes**: "10", "10-12", "AMRAP", "For Time"
- **Target Metrics**: Reps, time, distance, rounds, calories
- **Rest Periods**: Specific rest times between exercises/sets
- **Tempo Prescription**: "3-1-1-0" style tempo notation

### 4. **Intelligent Scaling System**
- **Multiple Difficulty Levels**: RX+, RX, Scaled, Beginner
- **Equipment Substitutions**: Alternative equipment options
- **Exercise Progressions**: Linked progressions and regressions
- **Contextual Scaling Notes**: Specific guidance for modifications

### 5. **Flexible Tagging & Classification**
- **Tag Types**: Movement, stimulus, equipment, muscle groups, skill levels
- **Movement Pattern Analysis**: Primary and secondary patterns per exercise
- **Color-coded Organization**: Visual categorization
- **Multi-dimensional Filtering**: Search by multiple criteria

### 6. **User Progress Tracking**
- **Session Completions**: Detailed performance logging per exercise
- **Progress Advancement**: Automatic week/day progression
- **Multiple Track Support**: Users can follow multiple tracks
- **Preference Management**: Track-specific settings (RX/Scaled preferences)
- **Performance Analytics**: Historical data with ratings and notes

## Data Relationships

### Primary Relationships
1. **Workout Tracks** → **Sessions** (1:Many)
2. **Sessions** → **Blocks** (1:Many) 
3. **Blocks** → **Block Exercises** (1:Many)
4. **Block Exercises** → **Exercises** (Many:1)
5. **Exercises** → **Scaling Options** (1:Many)
6. **Exercises** → **Exercise Variants** (1:Many)

### Junction Tables
1. **Exercises** ↔ **Tags** (via exercise_tags)
2. **Exercises** ↔ **Movement Patterns** (via exercise_patterns)

### User Relationships
1. **Users** → **Track Subscriptions** (1:Many)
2. **Users** → **Session Completions** (1:Many)
3. **Track Subscriptions** → **Session Completions** (1:Many)

## Performance Optimizations

### Indexes
- **Track Performance**: `idx_workout_tracks_active`, `idx_sessions_track_week`
- **Exercise Library**: `idx_exercises_category`, `idx_exercises_skill_level`
- **User Data**: `idx_user_session_completions_user_date`
- **Relationships**: `idx_exercise_patterns_exercise`, `idx_exercise_tags_exercise`

### Row Level Security (RLS)
- **Public Exercise Library**: Anyone can read exercises, scaling options, patterns
- **User Data Protection**: Users only access their own completions and subscriptions
- **Session Access**: Published sessions accessible to all users
- **Admin Controls**: Admins can manage all exercise and programming data

## API Integration

### Service Layer (`workoutService.js`)
The service layer provides clean abstractions for:

```javascript
// Track Management
workoutService.getWorkoutTracks()
workoutService.subscribeToWorkoutTrack(trackId, preferences)

// Session Access
workoutService.getTodaysSession(trackSlug)
workoutService.getThisWeekSessions(trackSlug)

// Exercise Library
workoutService.getExercises(filters)
workoutService.getExerciseById(exerciseId)

// Progress Tracking
workoutService.completeSession(sessionId, completionData)
workoutService.getUserSessionHistory()
```

## Migration Benefits

### From Previous Schema
- **Simplified Structure** → **Hierarchical Organization**
- **Basic Workouts** → **Structured Sessions with Blocks**
- **Limited Exercise Data** → **Comprehensive Exercise Library**
- **No Scaling Support** → **Advanced Scaling & Substitutions**
- **Basic Tracking** → **Detailed Performance Analytics**

### Scalability Improvements
- **Modular Design**: Each component can be extended independently
- **Exercise Reusability**: Single exercise library serves all tracks
- **Flexible Programming**: JSONB fields support any workout format
- **Performance Optimization**: Proper indexing for fast queries
- **Future-Proof**: Schema supports advanced features like AI recommendations

## Usage Examples

### Creating a Complete Workout Session
```sql
-- 1. Create session
INSERT INTO sessions (track_id, day_of_week, week_number, session_type, name, duration_minutes, intensity_level, is_published)
VALUES (track_uuid, 1, 1, 'Strength', 'Upper Body Power', 45, 7, true);

-- 2. Create warm-up block
INSERT INTO blocks (session_id, block_type, name, sequence, duration_minutes)
VALUES (session_uuid, 'Warm-Up', 'Dynamic Warm-up', 1, 10);

-- 3. Add warm-up exercises
INSERT INTO block_exercises (block_id, exercise_id, sequence, sets, reps, duration_seconds)
VALUES (warmup_block_uuid, arm_circles_uuid, 1, 1, '10 each direction', 30);

-- 4. Create strength block
INSERT INTO blocks (session_id, block_type, name, sequence, duration_minutes)
VALUES (session_uuid, 'Strength', 'Upper Body Strength', 2, 25);

-- 5. Add strength exercises with percentage-based loading
INSERT INTO block_exercises (block_id, exercise_id, sequence, sets, reps, load_type, load_value, rest_seconds)
VALUES (strength_block_uuid, bench_press_uuid, 1, 5, '3', 'percentage', 85.0, 180);
```

This scalable schema provides the foundation for a world-class fitness application that can grow with user needs while maintaining performance and flexibility. 