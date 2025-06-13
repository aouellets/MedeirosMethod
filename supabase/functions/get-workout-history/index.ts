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

    // Get timeframe from query params
    const url = new URL(req.url)
    const timeframe = url.searchParams.get('timeframe') || 'week'

    // Calculate start date based on timeframe
    const now = new Date()
    let startDate

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        startDate = new Date(0) // Beginning of time
    }

    // Get workout history
    const { data: history, error: historyError } = await supabaseClient
      .from('completed_sessions')
      .select(`
        *,
        sessions (
          id,
          name,
          session_type,
          duration_minutes,
          intensity_level,
          blocks (
            exercises (
              id
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false })

    if (historyError) {
      return new Response(
        JSON.stringify({ error: historyError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get workout statistics
    const stats = await calculateWorkoutStats(supabaseClient, user.id, startDate)

    return new Response(
      JSON.stringify({ history, stats }),
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

async function calculateWorkoutStats(supabaseClient, userId, startDate) {
  // Get all completed sessions in timeframe
  const { data: sessions } = await supabaseClient
    .from('completed_sessions')
    .select(`
      completed_at,
      sessions (
        duration_minutes,
        intensity_level
      )
    `)
    .eq('user_id', userId)
    .gte('completed_at', startDate.toISOString())
    .order('completed_at', { ascending: true })

  if (!sessions?.length) {
    return {
      totalWorkouts: 0,
      totalMinutes: 0,
      streakDays: 0,
      averageIntensity: 0,
    }
  }

  // Calculate basic stats
  const totalWorkouts = sessions.length
  const totalMinutes = sessions.reduce((acc, session) => acc + session.sessions.duration_minutes, 0)
  const averageIntensity = Math.round(
    (sessions.reduce((acc, session) => acc + session.sessions.intensity_level, 0) / totalWorkouts) * 10
  ) / 10

  // Calculate streak
  const dates = sessions.map(s => new Date(s.completed_at).toDateString())
  let streak = 1
  let currentDate = new Date(dates[0])

  for (let i = 1; i < dates.length; i++) {
    const nextDate = new Date(dates[i])
    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      streak++
      currentDate = nextDate
    } else {
      break
    }
  }

  return {
    totalWorkouts,
    totalMinutes,
    streakDays: streak,
    averageIntensity,
  }
} 