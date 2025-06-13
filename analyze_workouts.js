const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lvacourlbrjwlvioqrqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWNvdXJsYnJqd2x2aW9xcnFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMTg3OCwiZXhwIjoyMDYyMzc3ODc4fQ.2wV8nkLg8rb37Sm27KytZtuG6c4Lp3R7GRv4t_c9dwM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeWorkouts() {
  console.log('🔍 Analyzing generated workouts...\n')

  try {
    // Get all tracks
    const { data: tracks, error: tracksError } = await supabase
      .from('workout_tracks')
      .select('id, name, slug, days_per_week, sessions_per_day')
      .order('display_order')

    if (tracksError) throw tracksError

    console.log('📊 TRACK ANALYSIS')
    console.log('='.repeat(50))

    let totalSessions = 0
    const trackAnalysis = []

    for (const track of tracks) {
      // Get sessions for this track
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, week_number, day_of_week, session_type, name')
        .eq('track_id', track.id)
        .order('week_number')
        .order('day_of_week')

      if (sessionsError) throw sessionsError

      // Analyze coverage
      const weekCoverage = {}
      const dayCoverage = {}
      
      sessions.forEach(session => {
        const week = session.week_number
        const day = session.day_of_week
        
        if (!weekCoverage[week]) weekCoverage[week] = new Set()
        weekCoverage[week].add(day)
        
        if (!dayCoverage[day]) dayCoverage[day] = 0
        dayCoverage[day]++
      })

      const weeks = Object.keys(weekCoverage).map(Number).sort((a, b) => a - b)
      const minWeek = weeks.length > 0 ? Math.min(...weeks) : 0
      const maxWeek = weeks.length > 0 ? Math.max(...weeks) : 0
      
      const analysis = {
        track,
        sessionCount: sessions.length,
        weekRange: weeks.length > 0 ? `${minWeek}-${maxWeek}` : 'None',
        weeksGenerated: weeks.length,
        daysPerWeek: track.days_per_week,
        expectedSessionsPerWeek: track.days_per_week * track.sessions_per_day,
        coverage: weekCoverage,
        dayCoverage
      }

      trackAnalysis.push(analysis)
      totalSessions += sessions.length

      // Display track info
      console.log(`\n🎯 ${track.name} (${track.slug})`)
      console.log(`   Sessions: ${sessions.length}`)
      console.log(`   Week Range: ${analysis.weekRange}`)
      console.log(`   Weeks Generated: ${analysis.weeksGenerated}`)
      console.log(`   Expected per week: ${analysis.expectedSessionsPerWeek} sessions`)
      
      if (analysis.weeksGenerated > 0) {
        const avgSessionsPerWeek = sessions.length / analysis.weeksGenerated
        console.log(`   Actual avg per week: ${avgSessionsPerWeek.toFixed(1)} sessions`)
        
        // Check for gaps
        const gaps = []
        for (let week = minWeek; week <= maxWeek; week++) {
          if (!weekCoverage[week]) {
            gaps.push(week)
          } else {
            const daysInWeek = weekCoverage[week].size
            if (daysInWeek < track.days_per_week) {
              console.log(`   ⚠️  Week ${week}: Only ${daysInWeek}/${track.days_per_week} days`)
            }
          }
        }
        
        if (gaps.length > 0) {
          console.log(`   ❌ Missing weeks: ${gaps.join(', ')}`)
        }
      }
    }

    // Overall summary
    console.log('\n' + '='.repeat(50))
    console.log('📈 OVERALL SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Sessions Generated: ${totalSessions}`)
    console.log(`Total Tracks: ${tracks.length}`)
    console.log(`Average Sessions per Track: ${(totalSessions / tracks.length).toFixed(1)}`)

    // Check for duplicates
    console.log('\n🔍 DUPLICATE CHECK')
    console.log('='.repeat(30))
    
    const { data: duplicateCheck, error: dupError } = await supabase
      .from('sessions')
      .select('track_id, week_number, day_of_week, count(*)')
      .group('track_id, week_number, day_of_week')
      .having('count(*) > 1')

    if (dupError) {
      console.log('❌ Could not check for duplicates:', dupError.message)
    } else if (duplicateCheck && duplicateCheck.length > 0) {
      console.log(`⚠️  Found ${duplicateCheck.length} potential duplicates`)
      duplicateCheck.forEach(dup => {
        console.log(`   Track ${dup.track_id}, Week ${dup.week_number}, Day ${dup.day_of_week}: ${dup.count} sessions`)
      })
    } else {
      console.log('✅ No duplicates found')
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS')
    console.log('='.repeat(30))
    
    const incompleteTrack = trackAnalysis.find(t => t.weeksGenerated < 10)
    if (incompleteTrack) {
      console.log('📝 Some tracks have fewer than 10 weeks of programming')
    }
    
    const lowCoverageTrack = trackAnalysis.find(t => 
      t.sessionCount < (t.expectedSessionsPerWeek * 8) // Less than 8 weeks worth
    )
    if (lowCoverageTrack) {
      console.log('📝 Some tracks may need more sessions generated')
    }

    console.log('\n🎉 Analysis complete!')

  } catch (error) {
    console.error('❌ Error analyzing workouts:', error.message)
  }
}

// Run the analysis
analyzeWorkouts() 