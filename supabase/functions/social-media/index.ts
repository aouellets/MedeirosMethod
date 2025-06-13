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
    // Create Supabase client
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (method) {
      case 'GET':
        return await handleGet(supabaseClient, user, action, url)
      case 'POST':
        return await handlePost(supabaseClient, user, action, req)
      case 'PUT':
        return await handlePut(supabaseClient, user, action, req)
      case 'DELETE':
        return await handleDelete(supabaseClient, user, action, url)
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleGet(supabaseClient: any, user: any, action: string | null, url: URL) {
  switch (action) {
    case 'personalized-feed':
      return await getPersonalizedFeed(supabaseClient, user, url)
    case 'trending-posts':
      return await getTrendingPosts(supabaseClient, url)
    case 'user-analytics':
      return await getUserAnalytics(supabaseClient, user, url)
    case 'content-recommendations':
      return await getContentRecommendations(supabaseClient, user, url)
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
  }
}

async function handlePost(supabaseClient: any, user: any, action: string | null, req: Request) {
  const body = await req.json()

  switch (action) {
    case 'moderate-content':
      return await moderateContent(supabaseClient, user, body)
    case 'generate-hashtags':
      return await generateHashtags(supabaseClient, body)
    case 'bulk-follow':
      return await bulkFollow(supabaseClient, user, body)
    case 'report-content':
      return await reportContent(supabaseClient, user, body)
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
  }
}

async function handlePut(supabaseClient: any, user: any, action: string | null, req: Request) {
  const body = await req.json()

  switch (action) {
    case 'update-engagement':
      return await updateEngagementMetrics(supabaseClient, body)
    case 'sync-external-data':
      return await syncExternalData(supabaseClient, user, body)
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
  }
}

async function handleDelete(supabaseClient: any, user: any, action: string | null, url: URL) {
  switch (action) {
    case 'cleanup-old-content':
      return await cleanupOldContent(supabaseClient, user, url)
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
  }
}

// Get personalized feed based on user's follows and interests
async function getPersonalizedFeed(supabaseClient: any, user: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    // Get users that the current user follows
    const { data: following } = await supabaseClient
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = following?.map((f: any) => f.following_id) || []
    
    // Include the user's own posts
    followingIds.push(user.id)

    // Get posts from followed users and public posts
    const { data: posts, error } = await supabaseClient
      .from('social_posts')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .or(`user_id.in.(${followingIds.join(',')}),is_public.eq.true`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return new Response(
      JSON.stringify({ posts }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Get trending posts based on engagement metrics
async function getTrendingPosts(supabaseClient: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const timeframe = url.searchParams.get('timeframe') || '24h'

  try {
    let timeFilter = new Date()
    switch (timeframe) {
      case '1h':
        timeFilter.setHours(timeFilter.getHours() - 1)
        break
      case '24h':
        timeFilter.setDate(timeFilter.getDate() - 1)
        break
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30)
        break
    }

    const { data: posts, error } = await supabaseClient
      .from('social_posts')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .gte('created_at', timeFilter.toISOString())
      .order('likes_count', { ascending: false })
      .order('comments_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    return new Response(
      JSON.stringify({ posts }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Get user analytics and insights
async function getUserAnalytics(supabaseClient: any, user: any, url: URL) {
  const timeframe = url.searchParams.get('timeframe') || '30d'

  try {
    let timeFilter = new Date()
    switch (timeframe) {
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30)
        break
      case '90d':
        timeFilter.setDate(timeFilter.getDate() - 90)
        break
    }

    // Get post analytics
    const { data: postStats } = await supabaseClient
      .from('social_posts')
      .select('likes_count, comments_count, shares_count, created_at')
      .eq('user_id', user.id)
      .gte('created_at', timeFilter.toISOString())

    // Get follower growth
    const { data: followerGrowth } = await supabaseClient
      .from('user_follows')
      .select('created_at')
      .eq('following_id', user.id)
      .gte('created_at', timeFilter.toISOString())

    // Calculate metrics
    const totalLikes = postStats?.reduce((sum: number, post: any) => sum + (post.likes_count || 0), 0) || 0
    const totalComments = postStats?.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0) || 0
    const totalShares = postStats?.reduce((sum: number, post: any) => sum + (post.shares_count || 0), 0) || 0
    const newFollowers = followerGrowth?.length || 0

    const analytics = {
      timeframe,
      posts: postStats?.length || 0,
      totalEngagement: totalLikes + totalComments + totalShares,
      totalLikes,
      totalComments,
      totalShares,
      newFollowers,
      averageEngagementPerPost: postStats?.length ? (totalLikes + totalComments + totalShares) / postStats.length : 0
    }

    return new Response(
      JSON.stringify({ analytics }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Get content recommendations based on user interests
async function getContentRecommendations(supabaseClient: any, user: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '10')

  try {
    // Get user's profile to understand interests
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('training_goals, fitness_level, equipment_access')
      .eq('id', user.id)
      .single()

    // Get user's recent post tags to understand interests
    const { data: recentPosts } = await supabaseClient
      .from('social_posts')
      .select('tags')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Extract common tags
    const userTags = recentPosts?.flatMap((post: any) => post.tags || []) || []
    const commonTags = [...new Set(userTags)]

    // Find similar users based on profile
    const { data: similarUsers } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('fitness_level', profile?.fitness_level)
      .neq('id', user.id)
      .limit(50)

    const similarUserIds = similarUsers?.map((u: any) => u.id) || []

    // Get recommended posts
    let query = supabaseClient
      .from('social_posts')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .neq('user_id', user.id)

    if (similarUserIds.length > 0) {
      query = query.in('user_id', similarUserIds)
    }

    const { data: recommendations, error } = await query
      .order('likes_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    return new Response(
      JSON.stringify({ recommendations }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Content moderation function
async function moderateContent(supabaseClient: any, user: any, body: any) {
  const { content, type } = body

  try {
    // Simple content moderation (in production, you'd use AI services)
    const inappropriateWords = ['spam', 'hate', 'abuse'] // Simplified list
    const hasInappropriateContent = inappropriateWords.some(word => 
      content.toLowerCase().includes(word)
    )

    const moderationResult = {
      approved: !hasInappropriateContent,
      confidence: hasInappropriateContent ? 0.9 : 0.1,
      flags: hasInappropriateContent ? ['inappropriate_language'] : [],
      suggestions: hasInappropriateContent ? ['Consider revising your content'] : []
    }

    return new Response(
      JSON.stringify({ moderation: moderationResult }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Generate hashtag suggestions
async function generateHashtags(supabaseClient: any, body: any) {
  const { content, exerciseName } = body

  try {
    // Simple hashtag generation based on content
    const suggestions = []
    
    if (exerciseName) {
      suggestions.push(`#${exerciseName.toLowerCase().replace(/\s+/g, '')}`)
    }

    // Add fitness-related hashtags based on content
    const fitnessKeywords = {
      'workout': ['#workout', '#fitness', '#training'],
      'crossfit': ['#crossfit', '#wod', '#functionalfitness'],
      'strength': ['#strength', '#powerlifting', '#strongman'],
      'cardio': ['#cardio', '#running', '#endurance'],
      'nutrition': ['#nutrition', '#healthyeating', '#fuelthebody']
    }

    Object.entries(fitnessKeywords).forEach(([keyword, tags]) => {
      if (content.toLowerCase().includes(keyword)) {
        suggestions.push(...tags)
      }
    })

    // Add general fitness hashtags
    suggestions.push('#medeirosmethod', '#earnedeveryday', '#fitnessmotivation')

    // Remove duplicates and limit to 10
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10)

    return new Response(
      JSON.stringify({ hashtags: uniqueSuggestions }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Bulk follow users
async function bulkFollow(supabaseClient: any, user: any, body: any) {
  const { userIds } = body

  try {
    const followData = userIds.map((userId: string) => ({
      follower_id: user.id,
      following_id: userId
    }))

    const { data, error } = await supabaseClient
      .from('user_follows')
      .upsert(followData, { onConflict: 'follower_id,following_id' })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, followed: data?.length || 0 }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Report inappropriate content
async function reportContent(supabaseClient: any, user: any, body: any) {
  const { contentId, contentType, reason, description } = body

  try {
    // In a real app, you'd have a content_reports table
    // For now, we'll just log the report
    console.log('Content reported:', {
      reportedBy: user.id,
      contentId,
      contentType,
      reason,
      description,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Content reported successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Update engagement metrics (for batch processing)
async function updateEngagementMetrics(supabaseClient: any, body: any) {
  const { postId, metrics } = body

  try {
    const { data, error } = await supabaseClient
      .from('social_posts')
      .update(metrics)
      .eq('id', postId)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, post: data[0] }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Sync external data (e.g., from fitness trackers)
async function syncExternalData(supabaseClient: any, user: any, body: any) {
  const { source, data } = body

  try {
    // Process external data based on source
    switch (source) {
      case 'fitness_tracker':
        // Update training stats with external data
        const { error } = await supabaseClient
          .from('training_stats')
          .update({
            total_training_time_minutes: data.totalMinutes,
            last_workout_date: data.lastWorkout,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (error) throw error
        break
      
      default:
        throw new Error('Unsupported data source')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data synced successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Cleanup old content
async function cleanupOldContent(supabaseClient: any, user: any, url: URL) {
  const days = parseInt(url.searchParams.get('days') || '90')

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // Delete old posts (only user's own posts)
    const { data, error } = await supabaseClient
      .from('social_posts')
      .delete()
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString())

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, deletedCount: data?.length || 0 }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
} 