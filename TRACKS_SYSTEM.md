# Justin Medeiros App - Programming Tracks System

## Overview

The app now supports a comprehensive programming tracks system with 8 specialized training tracks, each designed for different goals and experience levels. Users can subscribe to tracks and follow structured workouts with progress tracking.

## Programming Tracks

### 🔥 1. Medeiros Method
**The foundation of a champion.**

The exact training system that shaped Justin into a multi-time CrossFit Games champion. This is functional fitness at its highest level — blending Olympic lifting, gymnastics, and high-intensity conditioning in a way that builds both capacity and confidence.

- **Frequency:** 5–6 days/week
- **Features:** Strength Training, Metcon, Skill Work, Optional RX/Scaled/Competitor formats
- **Great for:** Intermediate+ CrossFitters, General athletes, Everyday fire-breathers
- **Difficulty:** 4/5

### 🏁 2. Compete
**Built for the arena.**

This is where champions sharpen their edge. Based on Justin's own competition training, Compete is a high-volume track with multiple daily sessions, structured peaking cycles, and precision progressions.

- **Frequency:** 6–7 days/week with AM/PM splits
- **Features:** Programmed by competitive season, Strength %, Gymnastics, Sprint intervals
- **Great for:** Advanced athletes, Quarterfinal+ hopefuls
- **Difficulty:** 5/5

### 💪 3. Conjugate Strength
**Westside grit meets modern performance.**

A powerlifting-based strength track that cycles max effort and dynamic effort sessions using the conjugate method. Perfect for athletes seeking raw strength, explosiveness, and structural balance.

- **Frequency:** 4 days/week
- **Features:** Rotating movement variations, Speed work, Bands, chains, GPP
- **Great for:** Lifters, Hybrid athletes, Off-season strength cycles
- **Difficulty:** 4/5

### 🏃 4. Endure
**Built for distance. Conditioned for life.**

Whether you're training for a 5K, triathlon, or just want to build serious aerobic capacity, this track has you covered. Includes structured running, rowing, biking, and swimming.

- **Frequency:** 3–6 days/week
- **Features:** Zone 2 work, Intervals, Tempo runs, Optional crossover with training/strength days
- **Great for:** Endurance athletes, Runners, Hybrid competitors
- **Difficulty:** 3/5

### 🏗️ 5. Build (Hypertrophy / Aesthetic)
**Train hard. Look strong.**

A classic hypertrophy program based on Justin's offseason training structure. Focuses on muscle growth, symmetry, and accessory strength while keeping function in mind.

- **Frequency:** 4–6 days/week
- **Features:** Push/Pull/Legs or Upper/Lower splits, Pump-focused accessory work
- **Great for:** Bodybuilders, Aesthetic-focused athletes, Offseason training
- **Difficulty:** 3/5

### 🧱 6. Foundations
**Start here. Build forever.**

Designed for beginners, returners, or those new to CrossFit-style training. Foundations walks you through key movements, pacing strategies, and how to train safely while still getting after it.

- **Frequency:** 3–5 days/week
- **Features:** Structured progressions, Movement library & video demos
- **Great for:** Beginners, New athletes, Return from injury
- **Difficulty:** 2/5

### 🎒 7. Minimal Gear
**No excuses. Just work.**

Whether you're in a hotel, garage, park, or living room — this track delivers high-quality programming using only dumbbells, bodyweight, and a few basics.

- **Frequency:** 20–30 min workouts
- **Features:** EMOMs, AMRAPs, Interval formats, Dumbbell + bodyweight focused
- **Great for:** Travelers, Minimalists, At-home athletes
- **Difficulty:** 3/5

### 🧘 8. Recover & Mobilize
**Move better. Recover faster.**

Daily mobility and movement prep sessions guided by trusted recovery partners. Designed to improve joint health, reduce soreness, and prep your body for high performance.

- **Frequency:** 10–20 min sessions
- **Features:** Pre/post-workout flows, Targeted by movement pattern (e.g. squat, overhead)
- **Great for:** Everyone
- **Difficulty:** 1/5

## Database Schema

### Core Tables

#### `tracks`
- Stores all available programming tracks
- Includes metadata like name, description, emoji, difficulty level, features, and suitable audience
- Tracks can be activated/deactivated and ordered for display

#### `workouts`
- Individual workout sessions within tracks
- Organized by week and day numbers for structured programming
- Contains workout metadata, equipment needed, duration, and detailed instructions as JSONB
- Can be published/unpublished

#### `workout_exercises`
- Detailed exercise breakdown for each workout
- Supports sets, reps, weights, percentages, duration, distance
- Ordered by exercise sequence within workouts

#### `user_track_subscriptions`
- Tracks which users are subscribed to which tracks
- Manages user progress (current week/day)
- Stores track-specific preferences (RX/Scaled, etc.)
- Can be paused/resumed

#### `user_workout_completions`
- Records when users complete workouts
- Stores performance data, ratings, notes
- Prevents duplicate completions on the same day
- Links to track subscriptions for progress tracking

### Key Features

1. **Multi-Track Support**: Users can subscribe to multiple tracks simultaneously
2. **Progress Tracking**: Automatic advancement through weeks and days
3. **Flexible Programming**: JSONB instructions support any workout format
4. **Performance Logging**: Detailed completion data with ratings and notes
5. **Subscription Management**: Pause/resume track subscriptions
6. **Row Level Security**: Users can only access their own data

## API Service Layer

The `trackService.js` provides a comprehensive API for:

- **Track Management**: Get all tracks, get track by slug
- **Subscriptions**: Subscribe/unsubscribe from tracks, manage preferences
- **Workout Access**: Get today's workout, week's workouts, track workouts
- **Progress Tracking**: Complete workouts, advance user progress
- **History**: View workout completion history

### Key Methods

```javascript
// Get all available tracks
await trackService.getTracks()

// Subscribe to a track
await trackService.subscribeToTrack(trackId, preferences)

// Get today's workout for a track
await trackService.getTodaysWorkout(trackSlug)

// Complete a workout
await trackService.completeWorkout(workoutId, completionData)

// Get user's workout history
await trackService.getUserWorkoutHistory()
```

## UI Components

### TrackSelectorScreen
- Displays all available tracks with rich information
- Shows difficulty levels, frequency, features, and suitable audience
- Allows users to subscribe to tracks
- Updated to use database-driven track data

### TrainingHomeScreen
- Shows user's active track with today's workout
- Displays this week's workout schedule with completion status
- Handles cases where no track is selected or no workout is available
- Real-time progress tracking and workout access

## Usage Flow

1. **Track Selection**: User browses available tracks and selects one that fits their goals
2. **Subscription**: User subscribes to track, starting at Week 1, Day 1
3. **Daily Training**: User sees today's workout based on their current progress
4. **Workout Completion**: User completes workout and logs performance/ratings
5. **Progress Advancement**: System automatically advances to next workout
6. **History Tracking**: All completions are logged for progress visualization

## Future Enhancements

- **Sample Workout Data**: Add comprehensive workout libraries for each track
- **Advanced Analytics**: Workout performance trends and insights
- **Social Features**: Share workouts and progress with community
- **Video Integration**: Embed exercise demonstration videos
- **Custom Track Creation**: Allow users to create custom programming
- **Coach Dashboard**: Administrative interface for track management

## Technical Notes

- All database operations use Row Level Security (RLS)
- JSONB fields provide flexibility for complex workout structures
- Proper indexing ensures fast queries across large datasets
- Service layer abstracts database complexity from UI components
- Error handling and loading states throughout the user experience 