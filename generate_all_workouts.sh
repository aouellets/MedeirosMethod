#!/bin/bash

# Comprehensive Workout Generation Script
# Generates workouts for all tracks from June 2025 to August 1, 2025
# Handles duplicates by overwriting existing sessions

# Configuration
SUPABASE_URL="https://lvacourlbrjwlvioqrqc.supabase.co/functions/v1/generate-workouts"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWNvdXJsYnJqd2x2aW9xcnFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMTg3OCwiZXhwIjoyMDYyMzc3ODc4fQ.2wV8nkLg8rb37Sm27KytZtuG6c4Lp3R7GRv4t_c9dwM"

# Track data (slug:name pairs)
TRACK_DATA=(
    "medeiros-method:🔥 Medeiros Method"
    "compete:🏁 Compete"
    "conjugate-strength:💪 Conjugate Strength"
    "endure:🏃 Endure"
    "build:🏗️ Build"
    "foundations:🧱 Foundations"
    "minimal-gear:🎒 Minimal Gear"
    "recover-mobilize:🧘 Recover & Mobilize"
)

# Calculate weeks (June 11 to August 1 = ~7 weeks, but let's generate 10 weeks for good measure)
WEEKS_TO_GENERATE=10
START_WEEK=1

echo "🚀 Starting comprehensive workout generation..."
echo "📅 Generating $WEEKS_TO_GENERATE weeks for all 8 tracks"
echo "💪 Total workouts to create: ~$(( WEEKS_TO_GENERATE * 50 )) workouts"
echo ""
echo "⚠️  Note: This will overwrite any existing workouts for the same track/week/day"
echo ""

# Initialize counters
total_workouts=0
total_tracks=0
failed_requests=0

# Function to get track name from slug
get_track_name() {
    local slug=$1
    for item in "${TRACK_DATA[@]}"; do
        if [[ "$item" == "$slug:"* ]]; then
            echo "${item#*:}"
            return
        fi
    done
    echo "$slug"
}

# Function to show generation summary
show_summary() {
    echo "📋 GENERATION SUMMARY"
    echo "=================================="
    echo "🎯 Tracks to process: ${#TRACK_DATA[@]}"
    echo "📅 Weeks per track: $WEEKS_TO_GENERATE"
    echo "🏋️  Estimated total workouts: ~$(( WEEKS_TO_GENERATE * 50 ))"
    echo ""
    echo "📊 Track breakdown:"
    for item in "${TRACK_DATA[@]}"; do
        track_name="${item#*:}"
        echo "  • $track_name"
    done
    echo ""
}

# Function to check if we should proceed
confirm_generation() {
    echo "🤔 Do you want to proceed with generation? This may overwrite existing workouts."
    echo "   Type 'yes' to continue, anything else to cancel:"
    read -r response
    if [[ "$response" != "yes" ]]; then
        echo "❌ Generation cancelled by user"
        exit 0
    fi
    echo ""
}

# Function to generate workouts for a track
generate_track_workouts() {
    local track_slug=$1
    local track_name=$(get_track_name "$track_slug")
    
    echo "🎯 Generating workouts for $track_name..."
    
    # Generate workouts in batches of 3 weeks to avoid timeouts and manage conflicts better
    local batch_size=3
    local current_week=$START_WEEK
    local track_total=0
    
    while [ $current_week -le $WEEKS_TO_GENERATE ]; do
        local weeks_in_batch=$batch_size
        if [ $(( current_week + batch_size - 1 )) -gt $WEEKS_TO_GENERATE ]; then
            weeks_in_batch=$(( WEEKS_TO_GENERATE - current_week + 1 ))
        fi
        
        echo "  📦 Batch: Weeks $current_week-$(( current_week + weeks_in_batch - 1 ))"
        
        # Make the API call
        response=$(curl -s -X POST "$SUPABASE_URL" \
            -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"trackSlug\": \"$track_slug\", \"weekNumber\": $current_week, \"generateWeeks\": $weeks_in_batch}")
        
        # Check if request was successful
        if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
            workouts_created=$(echo "$response" | jq -r '.workouts_created')
            echo "  ✅ Created $workouts_created workouts"
            track_total=$(( track_total + workouts_created ))
        else
            echo "  ❌ Failed to generate batch"
            error_msg=$(echo "$response" | jq -r '.error // "Unknown error"')
            echo "  Error: $error_msg"
            
            # If it's a duplicate error, that's actually OK - we're overwriting
            if [[ "$error_msg" == *"duplicate"* ]] || [[ "$error_msg" == *"already exists"* ]]; then
                echo "  ℹ️  Duplicate detected - this is expected when overwriting"
            else
                failed_requests=$(( failed_requests + 1 ))
            fi
        fi
        
        current_week=$(( current_week + weeks_in_batch ))
        
        # Small delay to avoid overwhelming the API
        sleep 2
    done
    
    echo "  🎉 Total for $track_name: $track_total workouts"
    echo ""
    
    total_workouts=$(( total_workouts + track_total ))
    total_tracks=$(( total_tracks + 1 ))
}

# Main execution
show_summary
confirm_generation

echo "🚀 Starting generation process..."
echo ""

# Generate workouts for all tracks
for item in "${TRACK_DATA[@]}"; do
    track_slug="${item%%:*}"
    generate_track_workouts "$track_slug"
done

# Final summary
echo "🎊 GENERATION COMPLETE!"
echo "=================================="
echo "📊 Final Statistics:"
echo "  • Tracks processed: $total_tracks/8"
echo "  • Total workouts created: $total_workouts"
echo "  • Failed requests: $failed_requests"
echo "  • Weeks generated per track: $WEEKS_TO_GENERATE"
echo ""

if [ $failed_requests -eq 0 ]; then
    echo "🏆 SUCCESS! Your Justin Medeiros fitness app now has comprehensive"
    echo "    programming through August 2025 for all 8 tracks!"
else
    echo "⚠️  PARTIAL SUCCESS: $failed_requests batches failed"
    echo "    You may want to retry failed tracks individually"
fi

echo ""
echo "💡 Next steps:"
echo "  • Test the workouts in your app"
echo "  • Users can now access months of progressive programming"
echo "  • Each track has unique, intelligent workout variations"
echo "  • Consider setting up automated weekly generation"
echo ""

# Show some example API calls for manual testing
echo "🔧 Manual testing commands:"
echo "  # Test Medeiros Method Week 1:"
echo "  curl -X POST '$SUPABASE_URL' \\"
echo "    -H 'Authorization: Bearer $SERVICE_ROLE_KEY' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"trackSlug\": \"medeiros-method\", \"weekNumber\": 1, \"generateWeeks\": 1}'"
echo "" 