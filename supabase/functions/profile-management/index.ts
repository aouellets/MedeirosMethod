import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProfileUpdateRequest {
  profile?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
    height_cm?: number;
    weight_kg?: number;
    fitness_level?: string;
    training_goals?: string[];
    preferred_workout_days?: string[];
    preferred_workout_time?: string;
    equipment_access?: string[];
    injury_history?: string;
    bio?: string;
    location?: string;
    timezone?: string;
    units_preference?: string;
  };
  notifications?: {
    notifications_enabled?: boolean;
    email_notifications?: boolean;
    push_notifications?: boolean;
    training_reminders?: boolean;
    social_sharing?: boolean;
    privacy_level?: string;
  };
  training_stats?: {
    total_workouts?: number;
    total_training_days?: number;
    current_streak?: number;
    longest_streak?: number;
    total_training_time_minutes?: number;
    last_workout_date?: string;
    favorite_workout_type?: string;
    pr_records?: Record<string, any>;
    monthly_goals?: Record<string, any>;
    achievements?: string[];
  };
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

    const method = req.method
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (method) {
      case 'GET':
        return await handleGetProfile(supabaseClient, user.id)
      
      case 'PUT':
      case 'PATCH':
        const updateData: ProfileUpdateRequest = await req.json()
        return await handleUpdateProfile(supabaseClient, user.id, updateData)
      
      case 'DELETE':
        if (action === 'avatar') {
          return await handleDeleteAvatar(supabaseClient, user.id)
        }
        return await handleDeleteProfile(supabaseClient, user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Profile management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleGetProfile(supabaseClient: any, userId: string) {
  try {
    // Get profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw profileError
    }

    // Get training stats
    const { data: trainingStats, error: statsError } = await supabaseClient
      .from('training_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (statsError) {
      console.warn('No training stats found, creating default:', statsError)
      // Create default training stats if they don't exist
      const { data: newStats, error: createError } = await supabaseClient
        .from('training_stats')
        .insert({ user_id: userId })
        .select()
        .single()

      if (createError) {
        throw createError
      }
      
      return new Response(
        JSON.stringify({ 
          profile, 
          training_stats: newStats,
          success: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        profile, 
        training_stats: trainingStats,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleUpdateProfile(supabaseClient: any, userId: string, updateData: ProfileUpdateRequest) {
  try {
    const results: any = {}

    // Update profile if provided
    if (updateData.profile) {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .update(updateData.profile)
        .eq('id', userId)
        .select()
        .single()

      if (profileError) {
        throw profileError
      }
      results.profile = profileData
    }

    // Update notifications settings
    if (updateData.notifications) {
      const { data: notificationsData, error: notificationsError } = await supabaseClient
        .from('profiles')
        .update(updateData.notifications)
        .eq('id', userId)
        .select()
        .single()

      if (notificationsError) {
        throw notificationsError
      }
      results.notifications = notificationsData
    }

    // Update training stats if provided
    if (updateData.training_stats) {
      const { data: statsData, error: statsError } = await supabaseClient
        .from('training_stats')
        .update(updateData.training_stats)
        .eq('user_id', userId)
        .select()
        .single()

      if (statsError) {
        throw statsError
      }
      results.training_stats = statsData
    }

    return new Response(
      JSON.stringify({ 
        ...results,
        success: true,
        message: 'Profile updated successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update profile', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleDeleteAvatar(supabaseClient: any, userId: string) {
  try {
    // Get current avatar URL
    const { data: profile, error: getError } = await supabaseClient
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (getError) {
      throw getError
    }

    // Delete from storage if exists
    if (profile.avatar_url) {
      const avatarPath = profile.avatar_url.split('/').pop()
      await supabaseClient.storage
        .from('avatars')
        .remove([`${userId}/${avatarPath}`])
    }

    // Update profile to remove avatar URL
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        profile: updatedProfile,
        success: true,
        message: 'Avatar deleted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Delete avatar error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete avatar', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleDeleteProfile(supabaseClient: any, userId: string) {
  try {
    // This would typically be a soft delete or require additional verification
    // For now, we'll just return an error as profile deletion should be handled carefully
    return new Response(
      JSON.stringify({ 
        error: 'Profile deletion not implemented',
        message: 'Please contact support for account deletion' 
      }),
      { 
        status: 501, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Delete profile error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete profile', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
} 