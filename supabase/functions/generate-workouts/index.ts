import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Exercise database with movement patterns and progressions
const EXERCISE_LIBRARY = {
  'Olympic Lift': {
    'squat_pattern': ['Back Squat', 'Front Squat', 'Overhead Squat', 'Goblet Squat', 'Zercher Squat'],
    'hinge_pattern': ['Deadlift', 'Romanian Deadlift', 'Sumo Deadlift', 'Trap Bar Deadlift', 'Single Leg RDL'],
    'press_pattern': ['Strict Press', 'Push Press', 'Jerk', 'Seated Press', 'Single Arm Press'],
    'pull_pattern': ['Clean', 'Power Clean', 'Hang Clean', 'Clean Pull', 'High Pull'],
    'snatch_pattern': ['Snatch', 'Power Snatch', 'Hang Snatch', 'Snatch Pull', 'Snatch Balance'],
    'complex_movements': ['Thrusters', 'Clean & Jerk', 'Snatch', 'Turkish Get-up']
  },
  'Gymnastics': {
    'upper_pull': ['Pull-ups', 'Chest-to-Bar', 'Muscle-ups', 'Ring Rows', 'Weighted Pull-ups'],
    'upper_push': ['Push-ups', 'Handstand Push-ups', 'Ring Dips', 'Parallette Push-ups'],
    'core': ['Toes-to-Bar', 'Knees-to-Elbows', 'V-ups', 'Hollow Holds', 'L-sits'],
    'locomotion': ['Burpees', 'Bear Crawl', 'Crab Walk', 'Duck Walk'],
    'jumping': ['Box Jumps', 'Broad Jumps', 'Jump Squats', 'Lateral Jumps'],
    'skills': ['Handstand Walk', 'Pistol Squats', 'Double Unders', 'Single Unders']
  },
  'Monostructural': {
    'rowing': ['Rowing', 'Ski Erg'],
    'cycling': ['Assault Bike', 'Echo Bike', 'Stationary Bike'],
    'running': ['Running', 'Treadmill', 'Track Work'],
    'swimming': ['Swimming', 'Pool Work']
  },
  'Accessory': {
    'upper_push': ['Dumbbell Press', 'Tricep Extensions', 'Lateral Raises', 'Chest Flyes'],
    'upper_pull': ['Dumbbell Rows', 'Face Pulls', 'Bicep Curls', 'Reverse Flyes'],
    'lower_push': ['Lunges', 'Step-ups', 'Bulgarian Split Squats', 'Calf Raises'],
    'lower_pull': ['Glute Bridges', 'Hip Thrusts', 'Hamstring Curls', 'Good Mornings'],
    'core': ['Planks', 'Russian Twists', 'Dead Bugs', 'Bird Dogs']
  }
}

// Intelligent rep schemes based on goals
const REP_SCHEMES = {
  'max_strength': ['1', '2', '3', '1-1-1', '2-2-2'],
  'strength': ['3', '5', '3-3-3', '5-5-5', '4-4-4'],
  'power': ['2', '3', '5', '3-3-3', '2-2-2-2'],
  'hypertrophy': ['8-12', '10-15', '12-15', '8-10'],
  'endurance': ['15-20', '20+', 'AMRAP', 'Max Reps'],
  'conditioning': ['21-15-9', '15-12-9', '10-8-6', 'AMRAP', 'For Time', 'EMOM']
}

// Load progression based on week and focus
const LOAD_PROGRESSION = {
  'linear': (week: number, basePercent: number) => Math.min(basePercent + (week - 1) * 2.5, 95),
  'wave': (week: number, basePercent: number) => {
    const wavePattern = [0, 2.5, 5, -5, 2.5, 5, 7.5, -7.5]
    return basePercent + (wavePattern[(week - 1) % 8] || 0)
  },
  'deload': (week: number, basePercent: number) => {
    return week % 4 === 0 ? basePercent * 0.7 : basePercent + Math.floor((week - 1) / 4) * 5
  }
}

// Famous CrossFit workouts for variety
const BENCHMARK_WORKOUTS = {
  'fran': {
    exercises: [
      { name: 'Thrusters', reps: '21-15-9', weight: 95, category: 'Olympic Lift' },
      { name: 'Pull-ups', reps: '21-15-9', category: 'Gymnastics' }
    ],
    style: 'For Time'
  },
  'helen': {
    exercises: [
      { name: 'Running', distance: 400, category: 'Monostructural' },
      { name: 'Kettlebell Swings', reps: '21', weight: 53, category: 'Olympic Lift' },
      { name: 'Pull-ups', reps: '12', category: 'Gymnastics' }
    ],
    style: '3 Rounds For Time'
  },
  'cindy': {
    exercises: [
      { name: 'Pull-ups', reps: '5', category: 'Gymnastics' },
      { name: 'Push-ups', reps: '10', category: 'Gymnastics' },
      { name: 'Air Squats', reps: '15', category: 'Gymnastics' }
    ],
    style: '20 min AMRAP'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { trackSlug, weekNumber = 1, generateWeeks = 1 } = await req.json()

    const { data: track } = await supabaseClient
      .from('workout_tracks')
      .select('*')
      .eq('slug', trackSlug)
      .single()

    if (!track) {
      throw new Error(`Track not found: ${trackSlug}`)
    }

    const generator = new IntelligentWorkoutGenerator(supabaseClient, track)
    const results = []

    for (let week = weekNumber; week < weekNumber + generateWeeks; week++) {
      const weekWorkouts = await generator.generateWeek(week)
      results.push(...weekWorkouts)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        track: track.name,
        weeks_generated: generateWeeks,
        workouts_created: results.length,
        workouts: results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

class IntelligentWorkoutGenerator {
  private supabaseClient: any
  private track: any
  private usedExercises: Set<string> = new Set()
  private weeklyFocusRotation: string[] = []

  constructor(supabaseClient: any, track: any) {
    this.supabaseClient = supabaseClient
    this.track = track
  }

  async generateWeek(weekNumber: number) {
    const workouts = []
    const template = this.getTrackTemplate()
    
    for (const dayTemplate of template.weekly_structure) {
      const workout = await this.generateWorkout(dayTemplate, weekNumber)
      workouts.push(workout)
    }

    // Clear used exercises every 2 weeks to allow some repetition but maintain variety
    if (weekNumber % 2 === 0) {
      this.usedExercises.clear()
    }

    return workouts
  }

  private getTrackTemplate() {
    switch (this.track.slug) {
      case 'medeiros-method':
        return this.generateMedeirosTemplate()
      case 'compete':
        return this.generateCompeteTemplate()
      case 'conjugate-strength':
        return this.generateConjugateTemplate()
      case 'endure':
        return this.generateEndureTemplate()
      case 'build':
        return this.generateBuildTemplate()
      case 'foundations':
        return this.generateFoundationsTemplate()
      case 'minimal-gear':
        return this.generateMinimalGearTemplate()
      case 'recover-mobilize':
        return this.generateRecoveryTemplate()
      default:
        throw new Error(`Unknown track: ${this.track.slug}`)
    }
  }

  private generateMedeirosTemplate() {
    return {
      weekly_structure: [
        { day: 1, focus: 'upper_strength', intensity: 8, duration: 60, session_type: 'Strength' },
        { day: 2, focus: 'lower_strength', intensity: 8, duration: 65, session_type: 'Strength' },
        { day: 3, focus: 'olympic_skill', intensity: 6, duration: 55, session_type: 'Skill' },
        { day: 4, focus: 'mixed_modal', intensity: 9, duration: 50, session_type: 'Conditioning' },
        { day: 5, focus: 'gymnastics', intensity: 7, duration: 55, session_type: 'Skill' },
        { day: 6, focus: 'endurance', intensity: 6, duration: 45, session_type: 'Conditioning' }
      ]
    }
  }

  private generateCompeteTemplate() {
    return {
      weekly_structure: [
        { day: 1, focus: 'max_strength', intensity: 9, duration: 90, session_type: 'Strength', session: 'AM' },
        { day: 1, focus: 'conditioning', intensity: 8, duration: 60, session_type: 'Conditioning', session: 'PM' },
        { day: 2, focus: 'olympic_heavy', intensity: 9, duration: 90, session_type: 'Skill', session: 'AM' },
        { day: 2, focus: 'gymnastics', intensity: 7, duration: 60, session_type: 'Skill', session: 'PM' },
        { day: 3, focus: 'squat_strength', intensity: 8, duration: 90, session_type: 'Strength', session: 'AM' },
        { day: 3, focus: 'sprint_conditioning', intensity: 9, duration: 45, session_type: 'Conditioning', session: 'PM' },
        { day: 4, focus: 'upper_strength', intensity: 8, duration: 90, session_type: 'Strength', session: 'AM' },
        { day: 4, focus: 'mixed_modal', intensity: 8, duration: 60, session_type: 'Conditioning', session: 'PM' },
        { day: 5, focus: 'deadlift_strength', intensity: 8, duration: 90, session_type: 'Strength', session: 'AM' },
        { day: 5, focus: 'endurance', intensity: 6, duration: 60, session_type: 'Conditioning', session: 'PM' },
        { day: 6, focus: 'competition_simulation', intensity: 9, duration: 120, session_type: 'Conditioning', session: 'AM' },
        { day: 6, focus: 'recovery', intensity: 3, duration: 30, session_type: 'Recovery', session: 'PM' },
        { day: 7, focus: 'active_recovery', intensity: 4, duration: 45, session_type: 'Recovery' }
      ]
    }
  }

  private generateConjugateTemplate() {
    const rotation = ['max_effort_upper', 'max_effort_lower', 'dynamic_effort_upper', 'dynamic_effort_lower']
    return {
      weekly_structure: rotation.map((focus, index) => ({
        day: index + 1,
        focus,
        intensity: focus.includes('max_effort') ? 9 : 7,
        duration: 75,
        session_type: 'Strength'
      }))
    }
  }

  private generateEndureTemplate() {
    const enduranceTypes = [
      { focus: 'zone2', intensity: 4, duration: 60 },
      { focus: 'tempo', intensity: 7, duration: 45 },
      { focus: 'intervals', intensity: 8, duration: 50 },
      { focus: 'long_distance', intensity: 5, duration: 90 },
      { focus: 'recovery', intensity: 3, duration: 30 }
    ]
    
    return {
      weekly_structure: enduranceTypes.map((type, index) => ({
        day: index + 1,
        ...type,
        session_type: 'Endurance'
      }))
    }
  }

  private generateBuildTemplate() {
    const splits = ['push', 'pull', 'legs', 'upper', 'lower']
    return {
      weekly_structure: splits.map((split, index) => ({
        day: index + 1,
        focus: split,
        intensity: 6,
        duration: 75,
        session_type: 'Hypertrophy'
      }))
    }
  }

  private generateFoundationsTemplate() {
    return {
      weekly_structure: Array.from({ length: 4 }, (_, index) => ({
        day: index + 1,
        focus: 'foundation_movement',
        intensity: 3,
        duration: 45,
        session_type: 'Foundation'
      }))
    }
  }

  private generateMinimalGearTemplate() {
    const formats = ['emom', 'amrap', 'for_time', 'intervals', 'tabata']
    return {
      weekly_structure: formats.map((format, index) => ({
        day: index + 1,
        focus: format,
        intensity: 7,
        duration: 25,
        session_type: 'Conditioning'
      }))
    }
  }

  private generateRecoveryTemplate() {
    const focuses = ['shoulders', 'hips', 'spine', 'ankles', 'full_body', 'breathing', 'recovery']
    return {
      weekly_structure: focuses.map((focus, index) => ({
        day: index + 1,
        focus,
        intensity: 1,
        duration: 15,
        session_type: 'Recovery'
      }))
    }
  }

  private async generateWorkout(dayTemplate: any, weekNumber: number) {
    const sessionName = this.generateSessionName(dayTemplate, weekNumber)
    const blocks = await this.generateBlocks(dayTemplate, weekNumber)

    const session = await this.insertSession({
      track_id: this.track.id,
      day_of_week: dayTemplate.day,
      week_number: weekNumber,
      session_type: dayTemplate.session_type,
      name: sessionName,
      duration_minutes: dayTemplate.duration,
      intensity_level: dayTemplate.intensity,
      is_published: true
    })

    for (const blockData of blocks) {
      await this.insertBlock(session.id, blockData)
    }

    return {
      session_id: session.id,
      name: sessionName,
      day: dayTemplate.day,
      focus: dayTemplate.focus,
      blocks_created: blocks.length
    }
  }

  private generateSessionName(dayTemplate: any, weekNumber: number): string {
    const focusNames = {
      'upper_strength': 'Upper Body Strength',
      'lower_strength': 'Lower Body Strength',
      'olympic_skill': 'Olympic Lifting',
      'mixed_modal': 'Mixed Modal',
      'gymnastics': 'Gymnastics Focus',
      'endurance': 'Aerobic Conditioning',
      'max_strength': 'Max Strength',
      'conditioning': 'High Intensity',
      'competition_simulation': 'Competition Prep',
      'zone2': 'Zone 2 Endurance',
      'tempo': 'Tempo Work',
      'intervals': 'Interval Training',
      'push': 'Push Focus',
      'pull': 'Pull Focus',
      'legs': 'Leg Focus',
      'emom': 'EMOM Conditioning',
      'amrap': 'AMRAP Challenge'
    }

    const baseName = focusNames[dayTemplate.focus] || dayTemplate.focus
    const sessionSuffix = dayTemplate.session ? ` - ${dayTemplate.session}` : ''
    
    return `Week ${weekNumber} - ${baseName}${sessionSuffix}`
  }

  private async generateBlocks(dayTemplate: any, weekNumber: number) {
    const blocks = []

    // Always start with warm-up
    blocks.push(this.generateWarmUpBlock(dayTemplate))

    // Generate main blocks based on focus
    switch (dayTemplate.focus) {
      case 'upper_strength':
      case 'lower_strength':
        blocks.push(this.generateStrengthBlock(dayTemplate, weekNumber))
        blocks.push(this.generateAccessoryBlock(dayTemplate))
        break
      
      case 'olympic_skill':
        blocks.push(this.generateOlympicSkillBlock(dayTemplate, weekNumber))
        blocks.push(this.generateShortConditioningBlock())
        break
      
      case 'mixed_modal':
        blocks.push(this.generateMixedModalBlock(dayTemplate, weekNumber))
        break
      
      case 'gymnastics':
        blocks.push(this.generateGymnasticsSkillBlock(dayTemplate))
        blocks.push(this.generateGymnasticsConditioningBlock())
        break
      
      case 'endurance':
        blocks.push(this.generateEnduranceBlock(dayTemplate, weekNumber))
        break

      case 'max_strength':
        blocks.push(this.generateMaxStrengthBlock(dayTemplate, weekNumber))
        break

      case 'conditioning':
        blocks.push(this.generateConditioningBlock(dayTemplate, weekNumber))
        break

      default:
        blocks.push(this.generateGenericBlock(dayTemplate, weekNumber))
    }

    return blocks
  }

  private generateWarmUpBlock(dayTemplate: any) {
    const warmUpExercises = this.selectWarmUpExercises(dayTemplate.focus)
    
    return {
      block_type: 'Warm-Up',
      name: 'Dynamic Warm-up',
      sequence: 1,
      duration_minutes: 10,
      exercises: warmUpExercises
    }
  }

  private generateStrengthBlock(dayTemplate: any, weekNumber: number) {
    const isUpper = dayTemplate.focus.includes('upper')
    const movements = this.selectStrengthMovements(isUpper, weekNumber)
    const basePercent = this.calculateBasePercent(dayTemplate.intensity)
    const weekPercent = LOAD_PROGRESSION.deload(weekNumber, basePercent)

    return {
      block_type: 'Strength',
      name: isUpper ? 'Upper Body Strength' : 'Lower Body Strength',
      sequence: 2,
      duration_minutes: 25,
      exercises: movements.map(movement => ({
        exercise_name: movement.name,
        category: movement.category,
        sets: movement.sets,
        reps: this.selectRepScheme('strength'),
        load_type: 'percentage',
        load_value: weekPercent,
        rest_seconds: 180,
        scaling_notes: movement.scaling
      }))
    }
  }

  private generateOlympicSkillBlock(dayTemplate: any, weekNumber: number) {
    const olympicMovement = this.selectOlympicMovement(weekNumber)
    const percent = LOAD_PROGRESSION.wave(weekNumber, 75)

    return {
      block_type: 'Skill',
      name: 'Olympic Lifting',
      sequence: 2,
      duration_minutes: 25,
      exercises: [{
        exercise_name: olympicMovement.name,
        category: 'Olympic Lift',
        sets: olympicMovement.sets,
        reps: olympicMovement.reps,
        load_type: 'percentage',
        load_value: percent,
        rest_seconds: 120,
        scaling_notes: olympicMovement.scaling
      }]
    }
  }

  private generateMixedModalBlock(dayTemplate: any, weekNumber: number) {
    const workoutStyle = this.selectWorkoutStyle(weekNumber)
    const movements = this.selectMixedModalMovements(workoutStyle, weekNumber)

    return {
      block_type: 'Metcon',
      name: `${workoutStyle.name} Conditioning`,
      sequence: 2,
      duration_minutes: workoutStyle.duration,
      exercises: movements
    }
  }

  private selectStrengthMovements(isUpper: boolean, weekNumber: number) {
    const category = isUpper ? 'upper' : 'lower'
    const availableMovements = this.getAvailableMovements(category)
    
    // Rotate movements to avoid repetition
    const rotationIndex = (weekNumber - 1) % availableMovements.length
    const primaryMovement = availableMovements[rotationIndex]
    
    this.usedExercises.add(primaryMovement.name)
    
    return [
      {
        name: primaryMovement.name,
        category: primaryMovement.category,
        sets: 5,
        scaling: primaryMovement.scaling
      }
    ]
  }

  private selectOlympicMovement(weekNumber: number) {
    const movements = [
      { name: 'Power Snatch', sets: 7, reps: '2', scaling: 'Scale to dumbbell snatch' },
      { name: 'Power Clean', sets: 6, reps: '3', scaling: 'Scale to dumbbell clean' },
      { name: 'Clean & Jerk', sets: 5, reps: '1+1', scaling: 'Scale to thrusters' },
      { name: 'Snatch', sets: 5, reps: '1', scaling: 'Scale to overhead squat' },
      { name: 'Hang Power Clean', sets: 6, reps: '3', scaling: 'Scale to dumbbell clean' },
      { name: 'Push Jerk', sets: 5, reps: '2', scaling: 'Scale to push press' }
    ]
    
    return movements[(weekNumber - 1) % movements.length]
  }

  private selectWorkoutStyle(weekNumber: number) {
    const styles = [
      { name: 'For Time', duration: 15, format: 'sprint' },
      { name: 'AMRAP', duration: 20, format: 'volume' },
      { name: 'EMOM', duration: 18, format: 'interval' },
      { name: 'Ladder', duration: 16, format: 'ascending' },
      { name: 'Tabata', duration: 12, format: 'high_intensity' },
      { name: 'Chipper', duration: 25, format: 'long_grind' }
    ]
    
    return styles[(weekNumber - 1) % styles.length]
  }

  private selectMixedModalMovements(style: any, weekNumber: number) {
    // Use benchmark workouts occasionally for variety
    if (weekNumber % 6 === 1) {
      const benchmarkNames = Object.keys(BENCHMARK_WORKOUTS)
      const benchmark = BENCHMARK_WORKOUTS[benchmarkNames[weekNumber % benchmarkNames.length]]
      return benchmark.exercises.map(ex => ({
        exercise_name: ex.name,
        category: ex.category,
        reps: ex.reps,
        load_type: ex.weight ? 'fixed_weight' : 'bodyweight',
        load_value: ex.weight,
        notes: benchmark.style,
        scaling_notes: `Classic benchmark workout - scale as needed`
      }))
    }

    // Generate unique movement combinations
    const seed = weekNumber + style.name.length
    const movements = this.generateMovementCombination(seed, style.format)
    
    return movements.map((movement, index) => ({
      exercise_name: movement.name,
      category: movement.category,
      reps: movement.reps,
      load_type: movement.load_type,
      load_value: movement.load_value,
      notes: style.name,
      scaling_notes: movement.scaling
    }))
  }

  private generateMovementCombination(seed: number, format: string) {
    const combinations = [
      // Power + Gymnastics + Monostructural
      [
        { name: 'Deadlifts', category: 'Olympic Lift', reps: '21', load_type: 'fixed_weight', load_value: 70, scaling: 'Scale weight as needed' },
        { name: 'Handstand Push-ups', category: 'Gymnastics', reps: '21', load_type: 'bodyweight', scaling: 'Scale to pike push-ups' },
        { name: 'Box Jumps', category: 'Gymnastics', reps: '21', load_type: 'bodyweight', scaling: '24"/20" box' }
      ],
      // Olympic + Gymnastics
      [
        { name: 'Thrusters', category: 'Olympic Lift', reps: '15', load_type: 'fixed_weight', load_value: 43, scaling: 'RX: 95/65 lbs' },
        { name: 'Chest-to-Bar Pull-ups', category: 'Gymnastics', reps: '15', load_type: 'bodyweight', scaling: 'Scale to pull-ups' },
        { name: 'Burpee Box Jump Overs', category: 'Gymnastics', reps: '15', load_type: 'bodyweight', scaling: 'Step over if needed' }
      ],
      // Bodyweight + Cardio
      [
        { name: 'Burpees', category: 'Gymnastics', reps: '10', load_type: 'bodyweight', scaling: 'Step back burpees' },
        { name: 'Air Squats', category: 'Gymnastics', reps: '15', load_type: 'bodyweight', scaling: 'Full range of motion' },
        { name: 'Push-ups', category: 'Gymnastics', reps: '20', load_type: 'bodyweight', scaling: 'Knee push-ups' }
      ],
      // Heavy + Fast
      [
        { name: 'Front Squats', category: 'Olympic Lift', reps: '12', load_type: 'fixed_weight', load_value: 60, scaling: 'Scale weight' },
        { name: 'Toes-to-Bar', category: 'Gymnastics', reps: '12', load_type: 'bodyweight', scaling: 'Scale to knee raises' },
        { name: 'Rowing', category: 'Monostructural', reps: '250m', load_type: 'none', scaling: 'Consistent pace' }
      ],
      // Gymnastics Heavy
      [
        { name: 'Muscle-ups', category: 'Gymnastics', reps: '8', load_type: 'bodyweight', scaling: 'Scale to ring rows + dips' },
        { name: 'Overhead Squats', category: 'Olympic Lift', reps: '12', load_type: 'fixed_weight', load_value: 35, scaling: 'Scale weight' },
        { name: 'Double Unders', category: 'Gymnastics', reps: '50', load_type: 'bodyweight', scaling: 'Scale to single unders' }
      ],
      // Endurance Mix
      [
        { name: 'Wall Balls', category: 'Olympic Lift', reps: '20', load_type: 'fixed_weight', load_value: 9, scaling: '20/14 lb ball' },
        { name: 'Calorie Row', category: 'Monostructural', reps: '15', load_type: 'none', scaling: 'Steady pace' },
        { name: 'Handstand Walk', category: 'Gymnastics', reps: '50 feet', load_type: 'bodyweight', scaling: 'Scale to bear crawl' }
      ]
    ]
    
    return combinations[seed % combinations.length]
  }

  private getAvailableMovements(category: string) {
    const movements = {
      'upper': [
        { name: 'Strict Press', category: 'Olympic Lift', scaling: 'Scale to dumbbell press' },
        { name: 'Bench Press', category: 'Olympic Lift', scaling: 'Scale to push-ups' },
        { name: 'Push Press', category: 'Olympic Lift', scaling: 'Scale to dumbbell press' },
        { name: 'Weighted Pull-ups', category: 'Gymnastics', scaling: 'Scale to pull-ups or ring rows' },
        { name: 'Incline Dumbbell Press', category: 'Olympic Lift', scaling: 'Scale weight as needed' },
        { name: 'Weighted Dips', category: 'Gymnastics', scaling: 'Scale to bodyweight dips' }
      ],
      'lower': [
        { name: 'Back Squat', category: 'Olympic Lift', scaling: 'Scale to goblet squats' },
        { name: 'Front Squat', category: 'Olympic Lift', scaling: 'Scale to goblet squats' },
        { name: 'Deadlift', category: 'Olympic Lift', scaling: 'Scale weight as needed' },
        { name: 'Romanian Deadlift', category: 'Olympic Lift', scaling: 'Scale to bodyweight RDL' },
        { name: 'Sumo Deadlift', category: 'Olympic Lift', scaling: 'Scale weight as needed' },
        { name: 'Bulgarian Split Squats', category: 'Accessory', scaling: 'Add weight as needed' }
      ]
    }
    
    return movements[category] || []
  }

  private selectWarmUpExercises(focus: string) {
    const warmUps = {
      'upper': [
        { exercise_name: 'Arm Circles', category: 'Warm-up', sets: 1, reps: '10 each direction', load_type: 'bodyweight' },
        { exercise_name: 'Shoulder Dislocates', category: 'Warm-up', sets: 1, reps: '10', load_type: 'bodyweight' },
        { exercise_name: 'Band Pull-aparts', category: 'Warm-up', sets: 2, reps: '15', load_type: 'bodyweight' }
      ],
      'lower': [
        { exercise_name: 'Leg Swings', category: 'Warm-up', sets: 1, reps: '10 each direction', load_type: 'bodyweight' },
        { exercise_name: 'Walking Lunges', category: 'Warm-up', sets: 1, reps: '10 each leg', load_type: 'bodyweight' },
        { exercise_name: 'Glute Bridges', category: 'Warm-up', sets: 2, reps: '15', load_type: 'bodyweight' }
      ],
      'general': [
        { exercise_name: 'Light Movement', category: 'Warm-up', duration_seconds: 600, load_type: 'bodyweight' },
        { exercise_name: 'Joint Mobility', category: 'Warm-up', duration_seconds: 300, load_type: 'bodyweight' }
      ]
    }
    
    if (focus.includes('upper')) return warmUps.upper
    if (focus.includes('lower')) return warmUps.lower
    return warmUps.general
  }

  private selectRepScheme(goal: string): string {
    const schemes = REP_SCHEMES[goal] || REP_SCHEMES.strength
    return schemes[Math.floor(Math.random() * schemes.length)]
  }

  private calculateBasePercent(intensity: number): number {
    const intensityMap = {
      1: 40, 2: 50, 3: 60, 4: 65, 5: 70,
      6: 75, 7: 80, 8: 85, 9: 90, 10: 95
    }
    return intensityMap[intensity] || 70
  }

  // Additional block generators...
  private generateAccessoryBlock(dayTemplate: any) {
    const accessoryMovements = this.selectAccessoryMovements(dayTemplate.focus)
    
    return {
      block_type: 'Accessory',
      name: 'Accessory Work',
      sequence: 3,
      duration_minutes: 15,
      exercises: accessoryMovements
    }
  }

  private selectAccessoryMovements(focus: string) {
    const isUpper = focus.includes('upper')
    const movements = isUpper ? [
      { exercise_name: 'Dumbbell Rows', category: 'Accessory', sets: 3, reps: '12', load_type: 'fixed_weight', rest_seconds: 90 },
      { exercise_name: 'Tricep Extensions', category: 'Accessory', sets: 3, reps: '15', load_type: 'fixed_weight', rest_seconds: 60 }
    ] : [
      { exercise_name: 'Walking Lunges', category: 'Accessory', sets: 3, reps: '12 each leg', load_type: 'bodyweight', rest_seconds: 90 },
      { exercise_name: 'Calf Raises', category: 'Accessory', sets: 3, reps: '20', load_type: 'bodyweight', rest_seconds: 60 }
    ]
    
    return movements
  }

  private generateShortConditioningBlock() {
    return {
      block_type: 'Metcon',
      name: 'Short Conditioning',
      sequence: 3,
      duration_minutes: 12,
      exercises: [
        { exercise_name: 'Rowing', category: 'Monostructural', duration_seconds: 720, load_type: 'none', notes: '12 min EMOM: 250m row' }
      ]
    }
  }

  private generateGymnasticsSkillBlock(dayTemplate: any) {
    const skillMovements = [
      { name: 'Ring Muscle-ups', sets: 5, reps: '3', scaling: 'Scale to ring rows + ring dips' },
      { name: 'Handstand Push-ups', sets: 4, reps: '5', scaling: 'Scale to pike push-ups' },
      { name: 'Pistol Squats', sets: 3, reps: '5 each leg', scaling: 'Scale to assisted pistols' },
      { name: 'L-sits', sets: 4, reps: '15 seconds', scaling: 'Scale to tucked L-sits' }
    ]
    
    const selectedMovement = skillMovements[Math.floor(Math.random() * skillMovements.length)]
    
    return {
      block_type: 'Skill',
      name: 'Gymnastics Skill',
      sequence: 2,
      duration_minutes: 20,
      exercises: [{
        exercise_name: selectedMovement.name,
        category: 'Gymnastics',
        sets: selectedMovement.sets,
        reps: selectedMovement.reps,
        load_type: 'bodyweight',
        rest_seconds: 120,
        scaling_notes: selectedMovement.scaling
      }]
    }
  }

  private generateGymnasticsConditioningBlock() {
    return {
      block_type: 'Metcon',
      name: 'Gymnastics Conditioning',
      sequence: 3,
      duration_minutes: 15,
      exercises: [
        { exercise_name: 'Toes-to-Bar', category: 'Gymnastics', reps: '50', load_type: 'bodyweight', notes: 'For Time' },
        { exercise_name: 'Double Unders', category: 'Gymnastics', reps: '100', load_type: 'bodyweight' },
        { exercise_name: 'Burpees', category: 'Gymnastics', reps: '25', load_type: 'bodyweight' }
      ]
    }
  }

  private generateEnduranceBlock(dayTemplate: any, weekNumber: number) {
    const duration = Math.min(30 + weekNumber * 2, 60) // Progressive duration
    const enduranceTypes = ['Running', 'Rowing', 'Cycling', 'Swimming']
    const selectedType = enduranceTypes[weekNumber % enduranceTypes.length]
    
    return {
      block_type: 'Endurance',
      name: 'Aerobic Work',
      sequence: 2,
      duration_minutes: duration,
      exercises: [
        { exercise_name: selectedType, category: 'Monostructural', duration_seconds: duration * 60, load_type: 'none', notes: `${dayTemplate.focus} effort` }
      ]
    }
  }

  private generateMaxStrengthBlock(dayTemplate: any, weekNumber: number) {
    const maxMovements = ['Clean & Jerk', 'Snatch', 'Back Squat', 'Deadlift', 'Strict Press']
    const selectedMovement = maxMovements[weekNumber % maxMovements.length]
    
    return {
      block_type: 'Strength',
      name: 'Max Effort',
      sequence: 2,
      duration_minutes: 40,
      exercises: [
        { exercise_name: selectedMovement, category: 'Olympic Lift', sets: 5, reps: '1', load_type: 'percentage', load_value: 90, rest_seconds: 240 }
      ]
    }
  }

  private generateConditioningBlock(dayTemplate: any, weekNumber: number) {
    return {
      block_type: 'Metcon',
      name: 'High Intensity Conditioning',
      sequence: 2,
      duration_minutes: 25,
      exercises: [
        { exercise_name: 'Assault Bike', category: 'Monostructural', reps: '50 calories', load_type: 'none' },
        { exercise_name: 'Deadlifts', category: 'Olympic Lift', reps: '40', load_type: 'fixed_weight', load_value: 102 }
      ]
    }
  }

  private generateGenericBlock(dayTemplate: any, weekNumber: number) {
    return {
      block_type: 'Conditioning',
      name: 'General Conditioning',
      sequence: 2,
      duration_minutes: 20,
      exercises: [
        { exercise_name: 'Mixed Movement', category: 'Gymnastics', reps: '10', load_type: 'bodyweight' }
      ]
    }
  }

  private async insertSession(sessionData: any) {
    // First, try to find existing session for this track/week/day
    const { data: existingSession } = await this.supabaseClient
      .from('sessions')
      .select('id')
      .eq('track_id', sessionData.track_id)
      .eq('week_number', sessionData.week_number)
      .eq('day_of_week', sessionData.day_of_week)
      .single()

    if (existingSession) {
      // Delete existing session and its related data
      await this.supabaseClient
        .from('sessions')
        .delete()
        .eq('id', existingSession.id)
      
      console.log(`Deleted existing session for track ${sessionData.track_id}, week ${sessionData.week_number}, day ${sessionData.day_of_week}`)
    }

    // Insert new session
    const { data, error } = await this.supabaseClient
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw new Error(`Failed to insert session: ${error.message}`)
    return data
  }

  private async insertBlock(sessionId: string, blockData: any) {
    const { data: block, error: blockError } = await this.supabaseClient
      .from('blocks')
      .insert({
        session_id: sessionId,
        block_type: blockData.block_type,
        name: blockData.name,
        sequence: blockData.sequence,
        duration_minutes: blockData.duration_minutes
      })
      .select()
      .single()

    if (blockError) throw new Error(`Failed to insert block: ${blockError.message}`)

    // Insert exercises for this block
    for (let i = 0; i < blockData.exercises.length; i++) {
      const exerciseTemplate = blockData.exercises[i]
      
      let { data: exercise } = await this.supabaseClient
        .from('exercises')
        .select('id')
        .ilike('name', `%${exerciseTemplate.exercise_name}%`)
        .limit(1)
        .single()

      if (!exercise) {
        const { data: newExercise, error: exerciseError } = await this.supabaseClient
          .from('exercises')
          .insert({
            name: exerciseTemplate.exercise_name,
            category: exerciseTemplate.category,
            equipment: ['barbell'],
            skill_level: 'Intermediate',
            is_active: true
          })
          .select()
          .single()

        if (exerciseError) {
          console.warn(`Failed to create exercise ${exerciseTemplate.exercise_name}:`, exerciseError.message)
          continue
        }
        exercise = newExercise
      }

      await this.supabaseClient
        .from('block_exercises')
        .insert({
          block_id: block.id,
          exercise_id: exercise.id,
          sequence: i + 1,
          sets: exerciseTemplate.sets,
          reps: exerciseTemplate.reps,
          duration_seconds: exerciseTemplate.duration_seconds,
          load_type: exerciseTemplate.load_type,
          load_value: exerciseTemplate.load_value,
          rest_seconds: exerciseTemplate.rest_seconds,
          notes: exerciseTemplate.notes,
          scaling_notes: exerciseTemplate.scaling_notes
        })
    }

    return block
  }
} 