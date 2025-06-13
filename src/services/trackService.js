import { supabase } from '../lib/supabase';

export const trackService = {
  // Get all active tracks
  async getTracks() {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
  },

  // Get track by slug
  async getTrackBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching track:', error);
      throw error;
    }
  },

  // Subscribe user to a track
  async subscribeToTrack(trackId, preferences = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingSubscription } = await supabase
        .from('user_track_subscriptions')
        .select('*')
        .eq('workout_track_id', trackId)
        .eq('user_id', user.id)
        .single();

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

        if (error) throw error;
        return data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('user_track_subscriptions')
          .insert({
            user_id: user.id,
            workout_track_id: trackId,
            preferences,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error subscribing to track:', error);
      throw error;
    }
  },

  // Get user's active track subscriptions
  async getUserActiveSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('user_track_subscriptions')
        .select(`
          *,
          workout_tracks (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  },

  // Pause track subscription
  async pauseTrackSubscription(subscriptionId) {
    try {
      const { data, error } = await supabase
        .from('user_track_subscriptions')
        .update({
          is_active: false,
          paused_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error pausing track subscription:', error);
      throw error;
    }
  },

  // Get workouts for a track
  async getTrackWorkouts(trackId, weekNumber = null, dayNumber = null) {
    try {
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (*)
        `)
        .eq('track_id', trackId)
        .eq('is_published', true);

      if (weekNumber !== null) {
        query = query.eq('week_number', weekNumber);
      }

      if (dayNumber !== null) {
        query = query.eq('day_number', dayNumber);
      }

      query = query.order('week_number').order('day_number');

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching track workouts:', error);
      throw error;
    }
  },

  // Get today's workout for user's active track
  async getTodaysWorkout(trackSlug) {
    try {
      // First get the track
      const track = await this.getTrackBySlug(trackSlug);
      if (!track) return null;

      // Get user's subscription to this track
      const { data: subscription } = await supabase
        .from('user_track_subscriptions')
        .select('*')
        .eq('track_id', track.id)
        .eq('is_active', true)
        .single();

      if (!subscription) return null;

      // Get today's workout based on current week/day
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (*)
        `)
        .eq('track_id', track.id)
        .eq('week_number', subscription.current_week)
        .eq('day_number', subscription.current_day)
        .eq('is_published', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching today\'s workout:', error);
      throw error;
    }
  },

  // Complete a workout
  async completeWorkout(workoutId, completionData = {}) {
    try {
      // Check if workout was already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCompletion } = await supabase
        .from('user_workout_completions')
        .select('id')
        .eq('workout_id', workoutId)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`)
        .single();

      if (existingCompletion) {
        throw new Error('Workout already completed today');
      }

      const { data, error } = await supabase
        .from('user_workout_completions')
        .insert({
          workout_id: workoutId,
          duration_minutes: completionData.duration_minutes,
          notes: completionData.notes,
          performance_data: completionData.performance_data || {},
          difficulty_rating: completionData.difficulty_rating,
          enjoyment_rating: completionData.enjoyment_rating,
        })
        .select()
        .single();

      if (error) throw error;

      // Update user's current day/week if needed
      await this.advanceUserProgress(workoutId);

      return data;
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  },

  // Advance user's progress to next day/week
  async advanceUserProgress(workoutId) {
    try {
      // Get the workout details
      const { data: workout } = await supabase
        .from('workouts')
        .select('track_id, week_number, day_number')
        .eq('id', workoutId)
        .single();

      if (!workout) return;

      // Get user's subscription
      const { data: subscription } = await supabase
        .from('user_track_subscriptions')
        .select('*')
        .eq('track_id', workout.track_id)
        .eq('is_active', true)
        .single();

      if (!subscription) return;

      // Only advance if this is the current workout
      if (subscription.current_week === workout.week_number && 
          subscription.current_day === workout.day_number) {
        
        // Check if there's a next day in the same week
        const { data: nextDayWorkout } = await supabase
          .from('workouts')
          .select('day_number')
          .eq('track_id', workout.track_id)
          .eq('week_number', workout.week_number)
          .gt('day_number', workout.day_number)
          .order('day_number')
          .limit(1)
          .single();

        let newWeek = subscription.current_week;
        let newDay = subscription.current_day + 1;

        if (!nextDayWorkout) {
          // No more days in this week, move to next week
          newWeek += 1;
          newDay = 1;
        }

        await supabase
          .from('user_track_subscriptions')
          .update({
            current_week: newWeek,
            current_day: newDay
          })
          .eq('id', subscription.id);
      }
    } catch (error) {
      console.error('Error advancing user progress:', error);
    }
  },

  // Get user's workout history
  async getUserWorkoutHistory(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('user_workout_completions')
        .select(`
          *,
          workouts (
            *,
            tracks (name, emoji)
          )
        `)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workout history:', error);
      throw error;
    }
  },

  // Get this week's workouts for a track
  async getThisWeekWorkouts(trackSlug) {
    try {
      const track = await this.getTrackBySlug(trackSlug);
      if (!track) return [];

      // Get user's subscription
      const { data: subscription } = await supabase
        .from('user_track_subscriptions')
        .select('*')
        .eq('track_id', track.id)
        .eq('is_active', true)
        .single();

      if (!subscription) return [];

      // Get this week's workouts
      const workouts = await this.getTrackWorkouts(track.id, subscription.current_week);

      // Check which ones are completed
      const { data: completions } = await supabase
        .from('user_workout_completions')
        .select('workout_id, completed_at')
        .in('workout_id', workouts.map(w => w.id))
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const completionMap = new Map(completions?.map(c => [c.workout_id, c.completed_at]) || []);

      return workouts.map(workout => ({
        ...workout,
        completed: completionMap.has(workout.id),
        completed_at: completionMap.get(workout.id),
        is_current: subscription.current_week === workout.week_number && 
                   subscription.current_day === workout.day_number
      }));
    } catch (error) {
      console.error('Error fetching this week\'s workouts:', error);
      throw error;
    }
  }
}; 