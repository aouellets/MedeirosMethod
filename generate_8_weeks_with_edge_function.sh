#!/bin/bash

# Generate 8 Weeks of Programming Using Edge Function
# Starting June 9, 2025 (Monday)

echo "🚀 GENERATING 8 WEEKS OF PROGRAMMING (EDGE FUNCTION)"
echo "===================================================="
echo "📅 Start Date: June 9, 2025 (Monday)"
echo "📊 Duration: 8 weeks"
echo "🎯 Tracks: All 8 tracks"
echo "🌐 Using: generate-workouts edge function"
echo ""

# Track configurations
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

WEEKS_TO_GENERATE=8
total_workouts=0
failed_requests=0

# Use the remote Supabase URL where the tracks exist
SUPABASE_URL="https://lvacourlbrjwlvioqrqc.supabase.co"

# Use the service role key for edge function calls
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWNvdXJsYnJqd2x2aW9xcnFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMTg3OCwiZXhwIjoyMDYyMzc3ODc4fQ.2wV8nkLg8rb37Sm27KytZtuG6c4Lp3R7GRv4t_c9dwM"

echo "🔗 Using Supabase URL: $SUPABASE_URL"
echo ""

for track_data in "${TRACKS[@]}"; do
    track_slug="${track_data%%:*}"
    track_name="${track_data#*:}"
    
    echo "🎯 Generating $track_name..."
    
    # Call the edge function to generate 8 weeks
    response=$(curl -s -X POST "$SUPABASE_URL/functions/v1/generate-workouts" \
        -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"trackSlug\": \"$track_slug\", \"weekNumber\": 1, \"generateWeeks\": $WEEKS_TO_GENERATE}")
    
    # Check if the response contains success
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        workouts_created=$(echo "$response" | jq -r '.workouts_created')
        weeks_generated=$(echo "$response" | jq -r '.weeks_generated')
        echo "  ✅ Created $workouts_created workouts across $weeks_generated weeks"
        total_workouts=$(( total_workouts + workouts_created ))
    else
        echo "  ❌ Failed"
        error_msg=$(echo "$response" | jq -r '.error // "Unknown error"')
        echo "  Error: $error_msg"
        echo "  Response: $response"
        failed_requests=$(( failed_requests + 1 ))
    fi
    
    # Small delay to avoid overwhelming the server
    sleep 2
done

echo ""
echo "🎊 PROGRAMMING GENERATION COMPLETE!"
echo "==================================="
echo "✅ Total workouts created: $total_workouts"
echo "❌ Failed tracks: $failed_requests"

if [ $failed_requests -eq 0 ]; then
    echo ""
    echo "🏆 SUCCESS! All tracks generated with intelligent programming!"
    echo "   Your app now has $total_workouts unique, intelligent workouts"
    echo "   spanning 8 weeks across all 8 tracks."
    echo ""
    echo "📋 Programming Features:"
    echo "   • Intelligent exercise selection with variety"
    echo "   • Progressive loading schemes"
    echo "   • Track-specific programming methodology"
    echo "   • Proper warm-up and cool-down blocks"
    echo "   • Benchmark workout integration"
    echo "   • Movement pattern rotation"
else
    echo ""
    echo "⚠️  Some tracks failed - you may want to retry them individually"
fi

echo ""
echo "💡 Next: Test your app to see the new intelligent workouts in action!"
echo "🎯 Each track now has 8 weeks of professionally designed programming" 