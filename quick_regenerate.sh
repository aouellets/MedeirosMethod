#!/bin/bash

# Quick Workout Regeneration Script
# Regenerates all workouts for all tracks (10 weeks each)

SUPABASE_URL="https://lvacourlbrjwlvioqrqc.supabase.co/functions/v1/generate-workouts"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWNvdXJsYnJqd2x2aW9xcnFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMTg3OCwiZXhwIjoyMDYyMzc3ODc4fQ.2wV8nkLg8rb37Sm27KytZtuG6c4Lp3R7GRv4t_c9dwM"

TRACKS=(
    "medeiros-method:🔥 Medeiros Method"
    "compete:🏁 Compete"
    "conjugate-strength:💪 Conjugate Strength"
    "endure:🏃 Endure"
    "build:🏗️ Build"
    "foundations:🧱 Foundations"
    "minimal-gear:🎒 Minimal Gear"
    "recover-mobilize:🧘 Recover & Mobilize"
)

WEEKS_TO_GENERATE=10
total_workouts=0
failed_requests=0

echo "🚀 QUICK WORKOUT REGENERATION"
echo "=================================="
echo "📅 Generating $WEEKS_TO_GENERATE weeks for all 8 tracks"
echo "💪 Estimated total: ~500 workouts"
echo ""

for track_data in "${TRACKS[@]}"; do
    track_slug="${track_data%%:*}"
    track_name="${track_data#*:}"
    
    echo "🎯 Generating $track_name..."
    
    # Generate all weeks at once for speed
    response=$(curl -s -X POST "$SUPABASE_URL" \
        -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"trackSlug\": \"$track_slug\", \"weekNumber\": 1, \"generateWeeks\": $WEEKS_TO_GENERATE}")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        workouts_created=$(echo "$response" | jq -r '.workouts_created')
        echo "  ✅ Created $workouts_created workouts"
        total_workouts=$(( total_workouts + workouts_created ))
    else
        echo "  ❌ Failed"
        error_msg=$(echo "$response" | jq -r '.error // "Unknown error"')
        echo "  Error: $error_msg"
        failed_requests=$(( failed_requests + 1 ))
    fi
    
    # Small delay
    sleep 1
done

echo ""
echo "🎊 REGENERATION COMPLETE!"
echo "=================================="
echo "✅ Total workouts created: $total_workouts"
echo "❌ Failed tracks: $failed_requests"

if [ $failed_requests -eq 0 ]; then
    echo ""
    echo "🏆 SUCCESS! All tracks regenerated with comprehensive programming!"
    echo "   Your app now has $total_workouts unique, intelligent workouts"
    echo "   spanning 10 weeks across all 8 tracks."
else
    echo ""
    echo "⚠️  Some tracks failed - you may want to retry them individually"
fi

echo ""
echo "💡 Next: Test your app to see the new workouts in action!" 