import { supabase } from '../lib/supabase';

export const workoutService = {
  // Get all active workout tracks
  async getWorkoutTracks() {
    try {
      const { data, error } = await supabase
        .from('workout_tracks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workout tracks:', error);
      throw error;
    }
  },

  // Get workout track by slug
  async getWorkoutTrackBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('workout_tracks')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workout track:', error);
      throw error;
    }
  },

  // Subscribe user to a workout track
  async subscribeToWorkoutTrack(workoutTrackId, preferences = {}) {
    try {
      // First, ensure we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Session error: ' + sessionError.message);
      }
      if (!session) {
        console.error('No active session');
        throw new Error('No active session');
      }

      // Refresh the session if needed
      if (session.expires_at * 1000 < Date.now()) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Session refresh error:', refreshError);
          throw new Error('Session refresh error: ' + refreshError.message);
        }
        if (!refreshedSession) {
          console.error('Failed to refresh session');
          throw new Error('Failed to refresh session');
        }
      }

      // Get the user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) {
        console.error('No user found');
        throw new Error('User not authenticated');
      }

      console.log('Authenticated user:', user.id);

      // Check for existing subscription
      const { data: existingSubscription, error: selectError } = await supabase
        .from('user_track_subscriptions')
        .select('*')
        .eq('workout_track_id', workoutTrackId)
        .eq('user_id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', selectError);
        throw selectError;
      }

      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('user_track_subscriptions')
          .update({
            is_active: true,
            preferences,
            paused_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        return data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('user_track_subscriptions')
          .insert({
            user_id: user.id,
            workout_track_id: workoutTrackId,
            preferences,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating subscription:', error);
          throw error;
        }
        return data;
      }
    } catch (error) {
      console.error('Error subscribing to workout track:', error);
      throw error;
    }
  },

  // Get user's active workout track subscriptions
  async getUserActiveSubscriptions() {
    try {
      const { data: subscriptions, error } = await supabase
        .from('user_track_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Manually fetch workout tracks for each subscription
      const subscriptionsWithTracks = await Promise.all(
        subscriptions.map(async (subscription) => {
          const { data: track, error: trackError } = await supabase
            .from('workout_tracks')
            .select('id, name, slug, emoji, description')
            .eq('id', subscription.workout_track_id)
            .single();

          if (trackError) {
            console.error('Error fetching track:', trackError);
            return subscription;
          }

          return {
            ...subscription,
            workout_tracks: track
          };
        })
      );

      return subscriptionsWithTracks;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  },

  // Get sessions for a track
  async getTrackSessions(trackId, weekNumber = null, dayOfWeek = null) {
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          blocks (
            *,
            block_exercises (
              *,
              exercises (*)
            )
          )
        `)
        .eq('track_id', trackId)
        .eq('is_published', true);

      if (weekNumber !== null) {
        query = query.eq('week_number', weekNumber);
      }

      if (dayOfWeek !== null) {
        query = query.eq('day_of_week', dayOfWeek);
      }

      query = query.order('week_number').order('day_of_week');

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching track sessions:', error);
      throw error;
    }
  },

  // Get today's workout session for a track
  async getTodaysSession(trackSlug) {
    try {
      // First get the track by slug
      const { data: track, error: trackError } = await supabase
        .from('workout_tracks')
        .select('id')
        .eq('slug', trackSlug)
        .single();

      if (trackError) throw trackError;

      const today = new Date();
      const dayOfWeek = today.getDay() || 7; // Convert Sunday (0) to 7

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          blocks (
            id,
            name,
            block_exercises (
              id,
              sequence,
              sets,
              reps,
              rest_seconds,
              notes,
              exercises (
                id,
                name,
                description,
                video_url
              )
            )
          )
        `)
        .eq('track_id', track.id)
        .eq('day_of_week', dayOfWeek)
        .eq('week_number', 1) // Default to week 1 for now
        .eq('is_published', true)
        .order('created_at', { ascending: true }); // Get oldest first if multiple

      if (error) throw error;
      
      // Return the first session if any exist, or null if none
      return sessions && sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      console.error('Error fetching today\'s session:', error);
      throw error;
    }
  },

  // Get this week's workout sessions for a track
  async getThisWeekSessions(trackSlug) {
    try {
      // First get the track by slug
      const { data: track, error: trackError } = await supabase
        .from('workout_tracks')
        .select('id')
        .eq('slug', trackSlug)
        .single();

      if (trackError) {
        console.error('Error fetching track:', trackError);
        throw trackError;
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *
        `)
        .eq('track_id', track.id)
        .eq('week_number', 1) // Default to week 1 for now
        .eq('is_published', true)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      // Get user completions separately
      const { data: completions, error: completionsError } = await supabase
        .from('user_session_completions')
        .select('session_id, completed_at')
        .eq('user_id', user.id)
        .in('session_id', sessions.map(s => s.id));

      if (completionsError) throw completionsError;

      // Create a map of completed sessions
      const completedSessionIds = new Set(completions?.map(c => c.session_id) || []);

      // Mark sessions as completed or current
      const today = new Date();
      const dayOfWeek = today.getDay() || 7;

      return sessions.map(session => ({
        ...session,
        completed: completedSessionIds.has(session.id),
        is_current: session.day_of_week === dayOfWeek,
      }));
    } catch (error) {
      console.error('Error fetching this week\'s sessions:', error);
      throw error;
    }
  },

  // Complete a workout session
  async completeWorkout(sessionId, workoutData = {}) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not authenticated');

    const completionData = {
      user_id: user.id,
      session_id: sessionId,
      completed_at: workoutData.completed_at || new Date().toISOString(),
      duration_seconds: workoutData.duration_seconds || 0,
      exercises_completed: workoutData.exercises_completed || 0,
      sets_completed: workoutData.sets_completed || 0,
      total_reps: workoutData.total_reps || 0,
      notes: workoutData.notes || null,
    };

    const { data, error } = await supabase
      .from('user_session_completions')
      .insert([completionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get workout history with optional timeframe filter
  async getWorkoutHistory(timeframe = 'week') {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    const { data: history, error } = await supabase
      .from('user_session_completions')
      .select(`
        *,
        sessions (
          id,
          name,
          session_type,
          duration_minutes,
          intensity_level,
          blocks (
            block_exercises (
              id
            )
          )
        )
      `)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return history.map(record => ({
      id: record.id,
      completed_at: record.completed_at,
      name: record.sessions.name,
      session_type: record.sessions.session_type,
      duration_minutes: record.sessions.duration_minutes,
      intensity_level: record.sessions.intensity_level,
      total_exercises: record.sessions.blocks.reduce(
        (acc, block) => acc + block.block_exercises.length,
        0
      ),
    }));
  },

  // Get workout statistics for a timeframe
  async getWorkoutStats(timeframe = 'week') {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    const { data: history, error } = await supabase
      .from('user_session_completions')
      .select(`
        completed_at,
        sessions (
          duration_minutes,
          intensity_level
        )
      `)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalWorkouts: history.length,
      totalMinutes: history.reduce((acc, record) => acc + record.sessions.duration_minutes, 0),
      streakDays: calculateStreak(history),
      averageIntensity: calculateAverageIntensity(history),
    };

    return stats;
  },

  // Get achievements for a completed workout
  async getWorkoutAchievements(workoutId) {
    const { data: achievements, error } = await supabase
      .from('workout_achievements')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return achievements;
  },

  // Exercise library methods
  async getExercises(filters = {}) {
    try {
      let query = supabase
        .from('exercises')
        .select(`
          *,
          exercise_patterns (
            movement_patterns (*)
          ),
          exercise_tags (
            tags (*)
          ),
          scaling_options (*)
        `)
        .eq('is_active', true);

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.skill_level) {
        query = query.eq('skill_level', filters.skill_level);
      }

      if (filters.equipment) {
        query = query.contains('equipment', [filters.equipment]);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  async getExerciseById(exerciseId) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_patterns (
            movement_patterns (*)
          ),
          exercise_tags (
            tags (*)
          ),
          scaling_options (*),
          exercise_variants!exercise_variants_base_exercise_id_fkey (*)
        `)
        .eq('id', exerciseId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }
  },

  // Get movement patterns
  async getMovementPatterns() {
    try {
      const { data, error } = await supabase
        .from('movement_patterns')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching movement patterns:', error);
      throw error;
    }
  },

  // Get tags
  async getTags(type = null) {
    try {
      let query = supabase
        .from('tags')
        .select('*');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }
};

// Helper function to calculate workout streak
function calculateStreak(history) {
  if (!history.length) return 0;

  const dates = history.map(record => new Date(record.completed_at).toDateString());
  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const nextDate = new Date(dates[i]);
    const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = nextDate;
    } else {
      break;
    }
  }

  return streak;
}

// Helper function to calculate average workout intensity
function calculateAverageIntensity(history) {
  if (!history.length) return 0;

  const totalIntensity = history.reduce(
    (acc, record) => acc + record.sessions.intensity_level,
    0
  );
  return Math.round((totalIntensity / history.length) * 10) / 10;
} 