import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, sessionId, workoutData } = await req.json()

    switch (action) {
      case 'start_session':
        return await startWorkoutSession(supabase, user.id, sessionId)
      
      case 'update_progress':
        return await updateWorkoutProgress(supabase, user.id, sessionId, workoutData)
      
      case 'complete_session':
        return await completeWorkoutSession(supabase, user.id, sessionId, workoutData)
      
      case 'pause_session':
        return await pauseWorkoutSession(supabase, user.id, sessionId)
      
      case 'resume_session':
        return await resumeWorkoutSession(supabase, user.id, sessionId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Error in track-workout-session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function startWorkoutSession(supabase: any, userId: string, sessionId: string) {
  // Create or update workout session tracking
  const { data, error } = await supabase
    .from('workout_session_tracking')
    .upsert({
      user_id: userId,
      session_id: sessionId,
      started_at: new Date().toISOString(),
      status: 'active',
      current_block: 0,
      current_exercise: 0,
      current_set: 1,
      exercises_completed: 0,
      sets_completed: 0,
      total_reps: 0,
      duration_seconds: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to start workout session: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function updateWorkoutProgress(supabase: any, userId: string, sessionId: string, workoutData: any) {
  const { data, error } = await supabase
    .from('workout_session_tracking')
    .update({
      current_block: workoutData.currentBlock || 0,
      current_exercise: workoutData.currentExercise || 0,
      current_set: workoutData.currentSet || 1,
      exercises_completed: workoutData.exercisesCompleted || 0,
      sets_completed: workoutData.setsCompleted || 0,
      total_reps: workoutData.totalReps || 0,
      duration_seconds: workoutData.durationSeconds || 0,
      last_updated: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update workout progress: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function completeWorkoutSession(supabase: any, userId: string, sessionId: string, workoutData: any) {
  // Update session tracking
  const { error: trackingError } = await supabase
    .from('workout_session_tracking')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      exercises_completed: workoutData.exercisesCompleted || 0,
      sets_completed: workoutData.setsCompleted || 0,
      total_reps: workoutData.totalReps || 0,
      duration_seconds: workoutData.durationSeconds || 0,
    })
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (trackingError) {
    throw new Error(`Failed to update session tracking: ${trackingError.message}`)
  }

  // Create completion record
  const { data, error } = await supabase
    .from('user_session_completions')
    .insert({
      user_id: userId,
      session_id: sessionId,
      completed_at: new Date().toISOString(),
      duration_seconds: workoutData.durationSeconds || 0,
      exercises_completed: workoutData.exercisesCompleted || 0,
      sets_completed: workoutData.setsCompleted || 0,
      total_reps: workoutData.totalReps || 0,
      notes: workoutData.notes || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create completion record: ${error.message}`)
  }

  // Update user stats
  await updateUserWorkoutStats(supabase, userId, workoutData)

  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function pauseWorkoutSession(supabase: any, userId: string, sessionId: string) {
  const { data, error } = await supabase
    .from('workout_session_tracking')
    .update({
      status: 'paused',
      paused_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to pause workout session: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function resumeWorkoutSession(supabase: any, userId: string, sessionId: string) {
  const { data, error } = await supabase
    .from('workout_session_tracking')
    .update({
      status: 'active',
      resumed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to resume workout session: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function updateUserWorkoutStats(supabase: any, userId: string, workoutData: any) {
  // Get current user stats
  const { data: currentStats } = await supabase
    .from('user_workout_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  const newStats: any = {
    user_id: userId,
    total_workouts: (currentStats?.total_workouts || 0) + 1,
    total_duration_seconds: (currentStats?.total_duration_seconds || 0) + (workoutData.durationSeconds || 0),
    total_exercises: (currentStats?.total_exercises || 0) + (workoutData.exercisesCompleted || 0),
    total_sets: (currentStats?.total_sets || 0) + (workoutData.setsCompleted || 0),
    total_reps: (currentStats?.total_reps || 0) + (workoutData.totalReps || 0),
    last_workout_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Calculate streak
  if (currentStats?.last_workout_date) {
    const lastWorkout = new Date(currentStats.last_workout_date)
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStats.current_streak = (currentStats.current_streak || 0) + 1
    } else if (daysDiff === 0) {
      // Same day, keep streak
      newStats.current_streak = currentStats.current_streak || 1
    } else {
      // Streak broken, reset to 1
      newStats.current_streak = 1
    }
  } else {
    // First workout
    newStats.current_streak = 1
  }

  // Update max streak if current streak is higher
  newStats.max_streak = Math.max(newStats.current_streak, currentStats?.max_streak || 0)

  // Upsert user stats
  await supabase
    .from('user_workout_stats')
    .upsert(newStats)
} 