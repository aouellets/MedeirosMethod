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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Get the request body
    const { sessionId, notes, performanceData } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if session exists
    const { data: session, error: sessionError } = await supabaseClient
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Check if session was already completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: existingCompletion } = await supabaseClient
      .from('completed_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .gte('completed_at', today.toISOString())
      .lt('completed_at', tomorrow.toISOString())
      .single()

    if (existingCompletion) {
      return new Response(
        JSON.stringify({ error: 'Session already completed today' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Complete the session
    const { data: completion, error: completionError } = await supabaseClient
      .from('completed_sessions')
      .insert([
        {
          user_id: user.id,
          session_id: sessionId,
          notes,
          performance_data: performanceData || {},
        },
      ])
      .select()
      .single()

    if (completionError) {
      return new Response(
        JSON.stringify({ error: completionError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Check for achievements
    const achievements = await checkAchievements(supabaseClient, user.id, sessionId)

    return new Response(
      JSON.stringify({ completion, achievements }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function checkAchievements(supabaseClient, userId, sessionId) {
  const achievements = []

  // Get user's completed sessions count
  const { count: totalSessions } = await supabaseClient
    .from('completed_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  // Check for first workout achievement
  if (totalSessions === 1) {
    const { data: achievement } = await supabaseClient
      .from('workout_achievements')
      .insert([
        {
          user_id: userId,
          workout_id: sessionId,
          achievement_type: 'first_workout',
          description: 'Completed your first workout!',
        },
      ])
      .select()
      .single()

    if (achievement) achievements.push(achievement)
  }

  // Check for streak achievements
  const { data: recentCompletions } = await supabaseClient
    .from('completed_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(7)

  if (recentCompletions?.length === 7) {
    const dates = recentCompletions.map(c => new Date(c.completed_at).toDateString())
    const isStreak = dates.every((date, i) => {
      if (i === 0) return true
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(date)
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays === 1
    })

    if (isStreak) {
      const { data: achievement } = await supabaseClient
        .from('workout_achievements')
        .insert([
          {
            user_id: userId,
            workout_id: sessionId,
            achievement_type: 'seven_day_streak',
            description: 'Completed workouts for 7 days in a row!',
          },
        ])
        .select()
        .single()

      if (achievement) achievements.push(achievement)
    }
  }

  return achievements
} 