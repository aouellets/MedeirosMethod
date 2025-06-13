#!/usr/bin/env node

/**
 * Generate 8 weeks of programming for all tracks starting June 9, 2025
 * This script calls the generate-workouts edge function for each track
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key'
const START_DATE = '2025-06-09' // June 9, 2025 (Monday)
const WEEKS_TO_GENERATE = 8

// All track slugs
const TRACK_SLUGS = [
  'medeiros-method',
  'compete', 
  'conjugate-strength',
  'endure',
  'build',
  'foundations',
  'minimal-gear',
  'recover-mobilize'
]

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function generateWorkoutsForTrack(trackSlug) {
  console.log(`\n🔥 Generating ${WEEKS_TO_GENERATE} weeks for ${trackSlug}...`)
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-workouts', {
      body: {
        trackSlug: trackSlug,
        weekNumber: 1,
        generateWeeks: WEEKS_TO_GENERATE,
        startDate: START_DATE
      }
    })

    if (error) {
      console.error(`❌ Error generating workouts for ${trackSlug}:`, error)
      return false
    }

    if (data.success) {
      console.log(`✅ Successfully generated ${data.workouts_created} workouts for ${data.track}`)
      console.log(`   📅 Weeks: ${data.weeks_generated}`)
      return true
    } else {
      console.error(`❌ Failed to generate workouts for ${trackSlug}:`, data.error)
      return false
    }

  } catch (err) {
    console.error(`❌ Exception generating workouts for ${trackSlug}:`, err.message)
    return false
  }
}

async function generateAllWorkouts() {
  console.log('🚀 Starting workout generation for all tracks')
  console.log(`📅 Start Date: ${START_DATE}`)
  console.log(`📊 Weeks to Generate: ${WEEKS_TO_GENERATE}`)
  console.log(`🎯 Tracks: ${TRACK_SLUGS.length}`)
  
  const results = {
    successful: [],
    failed: []
  }

  // Generate workouts for each track
  for (const trackSlug of TRACK_SLUGS) {
    const success = await generateWorkoutsForTrack(trackSlug)
    
    if (success) {
      results.successful.push(trackSlug)
    } else {
      results.failed.push(trackSlug)
    }

    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n📊 GENERATION SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Successful: ${results.successful.length}/${TRACK_SLUGS.length}`)
  
  if (results.successful.length > 0) {
    console.log('   - ' + results.successful.join('\n   - '))
  }

  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.length}/${TRACK_SLUGS.length}`)
    console.log('   - ' + results.failed.join('\n   - '))
  }

  console.log('\n🎉 Workout generation complete!')
  
  if (results.failed.length > 0) {
    process.exit(1)
  }
}

// Verify environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  console.error('\nExample:')
  console.error('   export SUPABASE_URL="https://your-project.supabase.co"')
  console.error('   export SUPABASE_ANON_KEY="your-anon-key"')
  console.error('   node scripts/generate_all_workouts.js')
  process.exit(1)
}

// Run the generation
generateAllWorkouts().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
}) 