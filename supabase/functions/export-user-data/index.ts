import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  format: 'json' | 'csv'
  include_media?: boolean
}

interface ExportResponse {
  success: boolean
  message?: string
  data?: any
  download_url?: string
  error?: string
}

// Export user profile data
async function exportProfileData(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return {
    profile: data,
    exported_at: new Date().toISOString()
  }
}

// Export user workouts and training data
async function exportWorkoutData(supabaseClient: any, userId: string) {
  const { data: workouts, error: workoutsError } = await supabaseClient
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercises (name, category, muscle_groups)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (workoutsError) {
    throw workoutsError
  }

  return workouts || []
}

// Export user training stats
async function exportTrainingStats(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('training_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // Not found is ok
    throw error
  }

  return data
}

// Export user progress photos
async function exportProgressPhotos(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('photo_date', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// Export user social posts
async function exportSocialPosts(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('social_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// Export user notifications
async function exportNotifications(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// Export user workout plans and programs
async function exportWorkoutPlans(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('workout_plans')
    .select(`
      *,
      workout_plan_exercises (
        *,
        exercises (name, category, muscle_groups)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// Export user achievements and milestones
async function exportAchievements(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('user_achievements')
    .select(`
      *,
      achievements (name, description, category)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// Export user connections and social data
async function exportSocialConnections(supabaseClient: any, userId: string) {
  // Get followers
  const { data: followers, error: followersError } = await supabaseClient
    .from('user_follows')
    .select(`
      follower_id,
      created_at,
      profiles!user_follows_follower_id_fkey (first_name, last_name)
    `)
    .eq('following_id', userId)

  if (followersError) {
    throw followersError
  }

  // Get following
  const { data: following, error: followingError } = await supabaseClient
    .from('user_follows')
    .select(`
      following_id,
      created_at,
      profiles!user_follows_following_id_fkey (first_name, last_name)
    `)
    .eq('follower_id', userId)

  if (followingError) {
    throw followingError
  }

  return {
    followers: followers || [],
    following: following || []
  }
}

// Convert data to CSV format
function convertToCSV(data: any[], tableName: string): string {
  if (!data || data.length === 0) {
    return `${tableName}\nNo data available\n\n`
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    `${tableName}`,
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
        return String(value).replace(/"/g, '""')
      }).join(',')
    ),
    '' // Empty line separator
  ].join('\n')

  return csvContent
}

// Main export function
async function exportUserData(
  supabaseClient: any,
  userId: string,
  format: string,
  includeMedia: boolean = false
): Promise<ExportResponse> {
  try {
    // Collect all user data
    const [
      profile,
      workouts,
      trainingStats,
      progressPhotos,
      socialPosts,
      notifications,
      workoutPlans,
      achievements,
      socialConnections
    ] = await Promise.all([
      exportProfileData(supabaseClient, userId),
      exportWorkoutData(supabaseClient, userId),
      exportTrainingStats(supabaseClient, userId),
      exportProgressPhotos(supabaseClient, userId),
      exportSocialPosts(supabaseClient, userId),
      exportNotifications(supabaseClient, userId),
      exportWorkoutPlans(supabaseClient, userId),
      exportAchievements(supabaseClient, userId),
      exportSocialConnections(supabaseClient, userId)
    ])

    const exportData = {
      export_info: {
        user_id: userId,
        exported_at: new Date().toISOString(),
        format: format,
        includes_media: includeMedia,
        total_records: {
          profile: 1,
          workouts: workouts.length,
          progress_photos: progressPhotos.length,
          social_posts: socialPosts.length,
          notifications: notifications.length,
          workout_plans: workoutPlans.length,
          achievements: achievements.length,
          followers: socialConnections.followers.length,
          following: socialConnections.following.length
        }
      },
      profile: profile,
      training_stats: trainingStats,
      workouts: workouts,
      progress_photos: progressPhotos,
      social_posts: socialPosts,
      notifications: notifications,
      workout_plans: workoutPlans,
      achievements: achievements,
      social_connections: socialConnections
    }

    if (format === 'csv') {
      // Convert to CSV format
      let csvContent = 'MEDEIROS METHOD - USER DATA EXPORT\n'
      csvContent += `Exported at: ${new Date().toISOString()}\n`
      csvContent += `User ID: ${userId}\n\n`

      csvContent += convertToCSV([profile.profile], 'PROFILE')
      csvContent += convertToCSV(trainingStats ? [trainingStats] : [], 'TRAINING_STATS')
      csvContent += convertToCSV(workouts, 'WORKOUTS')
      csvContent += convertToCSV(progressPhotos, 'PROGRESS_PHOTOS')
      csvContent += convertToCSV(socialPosts, 'SOCIAL_POSTS')
      csvContent += convertToCSV(notifications, 'NOTIFICATIONS')
      csvContent += convertToCSV(workoutPlans, 'WORKOUT_PLANS')
      csvContent += convertToCSV(achievements, 'ACHIEVEMENTS')
      csvContent += convertToCSV(socialConnections.followers, 'FOLLOWERS')
      csvContent += convertToCSV(socialConnections.following, 'FOLLOWING')

      return {
        success: true,
        message: 'Data exported successfully in CSV format',
        data: csvContent
      }
    }

    return {
      success: true,
      message: 'Data exported successfully in JSON format',
      data: exportData
    }

  } catch (error) {
    console.error('Export user data error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'GET') {
      // Get export request parameters
      const url = new URL(req.url)
      const format = url.searchParams.get('format') || 'json'
      const includeMedia = url.searchParams.get('include_media') === 'true'

      if (!['json', 'csv'].includes(format)) {
        return new Response(
          JSON.stringify({ error: 'Invalid format. Use json or csv.' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = await exportUserData(supabaseClient, user.id, format, includeMedia)

      if (!result.success) {
        return new Response(
          JSON.stringify(result),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (format === 'csv') {
        return new Response(
          result.data,
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="medeiros-method-export-${user.id}.csv"`
            } 
          }
        )
      }

      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Export user data error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 