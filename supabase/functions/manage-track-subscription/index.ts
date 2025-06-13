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

    // Get request body
    const { trackId, action } = await req.json()

    if (!trackId || !action) {
      return new Response(
        JSON.stringify({ error: 'Track ID and action are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if track exists
    const { data: track, error: trackError } = await supabaseClient
      .from('workout_tracks')
      .select('*')
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Handle different actions
    switch (action) {
      case 'subscribe': {
        // Check if user already has an active subscription
        const { data: existingSubscription } = await supabaseClient
          .from('user_track_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workout_track_id', trackId)
          .eq('is_active', true)
          .single()

        if (existingSubscription) {
          return new Response(
            JSON.stringify({ error: 'Already subscribed to this track' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        // Create new subscription
        const { data: subscription, error: subscriptionError } = await supabaseClient
          .from('user_track_subscriptions')
          .insert([
            {
              user_id: user.id,
              workout_track_id: trackId,
              is_active: true,
            },
          ])
          .select()
          .single()

        if (subscriptionError) {
          return new Response(
            JSON.stringify({ error: subscriptionError.message }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        return new Response(
          JSON.stringify({ subscription }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'unsubscribe': {
        // Find active subscription
        const { data: subscription } = await supabaseClient
          .from('user_track_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workout_track_id', trackId)
          .eq('is_active', true)
          .single()

        if (!subscription) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            }
          )
        }

        // Deactivate subscription
        const { data: updatedSubscription, error: updateError } = await supabaseClient
          .from('user_track_subscriptions')
          .update({ is_active: false })
          .eq('id', subscription.id)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        return new Response(
          JSON.stringify({ subscription: updatedSubscription }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }
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