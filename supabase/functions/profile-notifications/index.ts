import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  type: 'update_preferences' | 'send_notification' | 'send_bulk'
  preferences?: {
    notifications_enabled?: boolean
    email_notifications?: boolean
    push_notifications?: boolean
    training_reminders?: boolean
    workout_reminders?: boolean
    progress_updates?: boolean
    social_notifications?: boolean
    achievement_notifications?: boolean
    weekly_summary?: boolean
    marketing_emails?: boolean
  }
  notification?: {
    title: string
    body: string
    type: string
    data?: any
    scheduled_for?: string
  }
  bulk_notification?: {
    title: string
    body: string
    type: string
    data?: any
    user_filters?: {
      fitness_level?: string[]
      training_goals?: string[]
      last_active_days?: number
    }
  }
}

interface NotificationResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

// Get user's notification preferences
async function getUserPreferences(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select(`
      notifications_enabled,
      email_notifications,
      push_notifications,
      training_reminders,
      workout_reminders,
      progress_updates,
      social_notifications,
      achievement_notifications,
      weekly_summary,
      marketing_emails
    `)
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update notification preferences
async function updateNotificationPreferences(
  supabaseClient: any, 
  userId: string, 
  preferences: any
): Promise<NotificationResponse> {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(preferences)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      message: 'Notification preferences updated successfully',
      data: data
    }
  } catch (error) {
    console.error('Update preferences error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Send individual notification
async function sendNotification(
  supabaseClient: any,
  userId: string,
  notification: any
): Promise<NotificationResponse> {
  try {
    // Get user preferences to check if they want this type of notification
    const preferences = await getUserPreferences(supabaseClient, userId)
    
    if (!preferences.notifications_enabled) {
      return {
        success: false,
        error: 'User has disabled notifications'
      }
    }

    // Check specific notification type preferences
    const typePreferenceMap: { [key: string]: string } = {
      'training_reminder': 'training_reminders',
      'workout_reminder': 'workout_reminders',
      'achievement': 'achievement_notifications',
      'social': 'social_notifications',
      'progress': 'progress_updates',
    }

    const preferenceKey = typePreferenceMap[notification.type]
    if (preferenceKey && !preferences[preferenceKey]) {
      return {
        success: false,
        error: `User has disabled ${notification.type} notifications`
      }
    }

    // Store notification in database
    const { data: notificationData, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert([{
        user_id: userId,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        data: notification.data || {},
        scheduled_for: notification.scheduled_for || new Date().toISOString(),
        sent: false
      }])
      .select()
      .single()

    if (notificationError) {
      throw notificationError
    }

    // Here you would integrate with push notification service (FCM, APNs, etc.)
    // For now, we'll just mark it as sent
    await supabaseClient
      .from('notifications')
      .update({ sent: true, sent_at: new Date().toISOString() })
      .eq('id', notificationData.id)

    return {
      success: true,
      message: 'Notification sent successfully',
      data: notificationData
    }
  } catch (error) {
    console.error('Send notification error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Send bulk notifications
async function sendBulkNotification(
  supabaseClient: any,
  notification: any
): Promise<NotificationResponse> {
  try {
    // Build user query based on filters
    let query = supabaseClient
      .from('profiles')
      .select('id, notifications_enabled, push_notifications')
      .eq('notifications_enabled', true)
      .eq('push_notifications', true)

    if (notification.user_filters) {
      const filters = notification.user_filters
      
      if (filters.fitness_level) {
        query = query.in('fitness_level', filters.fitness_level)
      }
      
      if (filters.training_goals) {
        query = query.overlaps('training_goals', filters.training_goals)
      }
      
      if (filters.last_active_days) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - filters.last_active_days)
        query = query.gte('last_active_at', cutoffDate.toISOString())
      }
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      throw usersError
    }

    if (!users || users.length === 0) {
      return {
        success: false,
        error: 'No users match the specified filters'
      }
    }

    // Create notifications for all matching users
    const notifications = users.map(user => ({
      user_id: user.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      data: notification.data || {},
      scheduled_for: new Date().toISOString(),
      sent: false
    }))

    const { data: notificationData, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications)
      .select()

    if (notificationError) {
      throw notificationError
    }

    // Here you would send actual push notifications
    // For now, mark all as sent
    const notificationIds = notificationData.map((n: any) => n.id)
    await supabaseClient
      .from('notifications')
      .update({ sent: true, sent_at: new Date().toISOString() })
      .in('id', notificationIds)

    return {
      success: true,
      message: `Bulk notification sent to ${users.length} users`,
      data: {
        notification_count: users.length,
        user_ids: users.map((u: any) => u.id)
      }
    }
  } catch (error) {
    console.error('Send bulk notification error:', error)
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

    const requestData: NotificationRequest = await req.json()
    let result: NotificationResponse

    switch (requestData.type) {
      case 'update_preferences':
        if (!requestData.preferences) {
          return new Response(
            JSON.stringify({ error: 'Preferences are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        result = await updateNotificationPreferences(
          supabaseClient, 
          user.id, 
          requestData.preferences
        )
        break

      case 'send_notification':
        if (!requestData.notification) {
          return new Response(
            JSON.stringify({ error: 'Notification data is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        result = await sendNotification(
          supabaseClient,
          user.id,
          requestData.notification
        )
        break

      case 'send_bulk':
        if (!requestData.bulk_notification) {
          return new Response(
            JSON.stringify({ error: 'Bulk notification data is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        result = await sendBulkNotification(
          supabaseClient,
          requestData.bulk_notification
        )
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid request type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    const status = result.success ? 200 : 400
    return new Response(
      JSON.stringify(result),
      { 
        status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Profile notifications error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 