const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lvacourlbrjwlvioqrqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWNvdXJsYnJqd2x2aW9xcnFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMTg3OCwiZXhwIjoyMDYyMzc3ODc4fQ.2wV8nkLg8rb37Sm27KytZtuG6c4Lp3R7GRv4t_c9dwM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function simpleAnalysis() {
  console.log('🔍 Simple Database Analysis...\n')

  try {
    // Test connection and get basic counts
    console.log('📊 BASIC COUNTS')
    console.log('='.repeat(30))

    // Count tracks
    const { data: tracks, error: tracksError, count: trackCount } = await supabase
      .from('workout_tracks')
      .select('*', { count: 'exact' })

    if (tracksError) {
      console.log('❌ Error fetching tracks:', tracksError.message)
      return
    }

    console.log(`✅ Tracks: ${trackCount}`)

    // Count sessions
    const { data: sessions, error: sessionsError, count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact' })

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message)
      return
    }

    console.log(`✅ Sessions: ${sessionCount}`)

    // Count blocks
    const { data: blocks, error: blocksError, count: blockCount } = await supabase
      .from('blocks')
      .select('*', { count: 'exact' })

    if (blocksError) {
      console.log('❌ Error fetching blocks:', blocksError.message)
    } else {
      console.log(`✅ Blocks: ${blockCount}`)
    }

    // Count exercises
    const { data: exercises, error: exercisesError, count: exerciseCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact' })

    if (exercisesError) {
      console.log('❌ Error fetching exercises:', exercisesError.message)
    } else {
      console.log(`✅ Exercises: ${exerciseCount}`)
    }

    if (sessionCount > 0) {
      console.log('\n📋 SESSION BREAKDOWN BY TRACK')
      console.log('='.repeat(40))

      // Get sessions by track
      const { data: sessionsByTrack, error: sessionsByTrackError } = await supabase
        .from('sessions')
        .select(`
          track_id,
          week_number,
          day_of_week,
          session_type,
          workout_tracks!inner(name, slug)
        `)
        .order('track_id')
        .order('week_number')
        .order('day_of_week')

      if (sessionsByTrackError) {
        console.log('❌ Error fetching sessions by track:', sessionsByTrackError.message)
        return
      }

      // Group by track
      const trackGroups = {}
      sessionsByTrack.forEach(session => {
        const trackName = session.workout_tracks.name
        const trackSlug = session.workout_tracks.slug
        
        if (!trackGroups[trackSlug]) {
          trackGroups[trackSlug] = {
            name: trackName,
            sessions: [],
            weeks: new Set(),
            days: new Set()
          }
        }
        
        trackGroups[trackSlug].sessions.push(session)
        trackGroups[trackSlug].weeks.add(session.week_number)
        trackGroups[trackSlug].days.add(session.day_of_week)
      })

      // Display results
      Object.entries(trackGroups).forEach(([slug, data]) => {
        const weekArray = Array.from(data.weeks).sort((a, b) => a - b)
        const minWeek = Math.min(...weekArray)
        const maxWeek = Math.max(...weekArray)
        
        console.log(`\n🎯 ${data.name} (${slug})`)
        console.log(`   Sessions: ${data.sessions.length}`)
        console.log(`   Weeks: ${weekArray.length} (${minWeek}-${maxWeek})`)
        console.log(`   Days covered: ${Array.from(data.days).sort().join(', ')}`)
      })

      // Check for potential duplicates
      console.log('\n🔍 DUPLICATE CHECK')
      console.log('='.repeat(30))
      
      const duplicateMap = {}
      sessionsByTrack.forEach(session => {
        const key = `${session.track_id}-${session.week_number}-${session.day_of_week}`
        if (!duplicateMap[key]) {
          duplicateMap[key] = []
        }
        duplicateMap[key].push(session)
      })

      const duplicates = Object.entries(duplicateMap).filter(([key, sessions]) => sessions.length > 1)
      
      if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} potential duplicates:`)
        duplicates.forEach(([key, sessions]) => {
          const [trackId, week, day] = key.split('-')
          const trackName = sessions[0].workout_tracks.name
          console.log(`   ${trackName} - Week ${week}, Day ${day}: ${sessions.length} sessions`)
        })
      } else {
        console.log('✅ No duplicates found')
      }

    } else {
      console.log('\n⚠️  No sessions found in database')
      console.log('   This could mean:')
      console.log('   • Generation script didn\'t run successfully')
      console.log('   • Sessions are in a different database')
      console.log('   • Connection issue')
    }

  } catch (error) {
    console.error('❌ Error in analysis:', error.message)
  }
}

// Run the analysis
simpleAnalysis() 