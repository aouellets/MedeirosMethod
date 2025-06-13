import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // Create supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client to verify user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify the user is authenticated
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
    const { confirm } = method === 'POST' ? await req.json() : {}

    if (method !== 'POST' || !confirm) {
      return new Response(
        JSON.stringify({ 
          error: 'Account deletion requires POST request with confirmation',
          required: { confirm: true }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 1: Clean up user data using our database function
    const { error: cleanupError } = await supabaseAdmin.rpc('delete_user_data', {
      target_user_id: user.id
    })

    if (cleanupError) {
      console.error('Data cleanup error:', cleanupError)
      // Continue with deletion even if cleanup fails partially
    }

    // Step 2: Delete storage files
    try {
      // Delete user's avatar
      await supabaseAdmin.storage
        .from('avatars')
        .remove([`${user.id}/`])

      // Delete user's workout media
      await supabaseAdmin.storage
        .from('workout-media')
        .remove([`${user.id}/`])

      // Delete user's social media
      await supabaseAdmin.storage
        .from('social-media')
        .remove([`${user.id}/`])
    } catch (storageError) {
      console.error('Storage cleanup error:', storageError)
      // Continue with deletion even if storage cleanup fails
    }

    // Step 3: Delete the auth user (this will trigger any remaining cascade deletions)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('User deletion error:', deleteError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete user account',
          details: deleteError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful deletion
    console.log(`User account deleted successfully: ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account deleted successfully',
        deleted_user_id: user.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Delete account error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 