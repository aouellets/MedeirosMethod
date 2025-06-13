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

    // Get workout ID from query params
    const url = new URL(req.url)
    const workoutId = url.searchParams.get('workoutId')

    if (!workoutId) {
      return new Response(
        JSON.stringify({ error: 'Workout ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get achievements for the workout
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from('workout_achievements')
      .select('*')
      .eq('user_id', user.id)
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: false })

    if (achievementsError) {
      return new Response(
        JSON.stringify({ error: achievementsError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get all-time achievements
    const { data: allTimeAchievements, error: allTimeError } = await supabaseClient
      .from('workout_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (allTimeError) {
      return new Response(
        JSON.stringify({ error: allTimeError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Group achievements by type
    const achievementTypes = {
      first_workout: {
        title: 'First Workout',
        description: 'Completed your first workout',
        icon: '🎯',
      },
      seven_day_streak: {
        title: '7-Day Streak',
        description: 'Completed workouts for 7 days in a row',
        icon: '🔥',
      },
      thirty_day_streak: {
        title: '30-Day Streak',
        description: 'Completed workouts for 30 days in a row',
        icon: '💪',
      },
      hundred_workouts: {
        title: 'Century Club',
        description: 'Completed 100 workouts',
        icon: '🏆',
      },
      perfect_week: {
        title: 'Perfect Week',
        description: 'Completed all scheduled workouts in a week',
        icon: '⭐',
      },
    }

    // Format achievements with additional info
    const formattedAchievements = achievements.map(achievement => ({
      ...achievement,
      ...achievementTypes[achievement.achievement_type],
    }))

    const formattedAllTimeAchievements = allTimeAchievements.map(achievement => ({
      ...achievement,
      ...achievementTypes[achievement.achievement_type],
    }))

    return new Response(
      JSON.stringify({
        workoutAchievements: formattedAchievements,
        allTimeAchievements: formattedAllTimeAchievements,
      }),
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