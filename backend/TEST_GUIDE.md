# LangGraph Pipeline Test Guide

This guide explains how to test the 6-node LangGraph video testing pipeline.

## Prerequisites

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Prepare a test video:**
   - Use any video file (MP4, MOV, etc.)
   - For testing, shorter videos (10-60 seconds) work best
   - Make sure the path is accessible

## Running the Test

### Quick Test (5 personas - Fast)
```bash
python test_pipeline.py /path/to/video.mp4 test
```

This uses the `test.json` personas file with only 5 personas for quick testing.

### Platform-Specific Test
```bash
# Instagram test
python test_pipeline.py /path/to/video.mp4 instagram

# TikTok test
python test_pipeline.py /path/to/video.mp4 tiktok

# Twitter test
python test_pipeline.py /path/to/video.mp4 twitter

# YouTube test
python test_pipeline.py /path/to/video.mp4 youtube
```

**Note:** For platform-specific tests, you need to create persona JSON files:
- `app/data/personas/instagram.json`
- `app/data/personas/tiktok.json`
- `app/data/personas/twitter.json`
- `app/data/personas/youtube.json`

Currently, only `instagram.json` and `test.json` exist with sample data.

## What Happens During the Test

The script will run through all 6 nodes:

1. **Node 1: Video Analysis** - Gemini analyzes the video content
2. **Node 2: Initial Reactions** - Each persona reacts independently (parallel)
3. **Node 2.5: Network Generation** - Creates social network connections
4. **Node 3: Interactions** - Simulates social dynamics
5. **Node 4: Second Reactions** - Updated reactions after social influence (parallel)
6. **Node 5: Results Compilation** - Aggregates all data

## Console Output

You'll see real-time progress like:
```
==================================================
LANGGRAPH VIDEO TESTING PIPELINE - TEST RUN
==================================================
Video: /path/to/video.mp4
Platform: test
Test started: 2025-11-21 15:30:00
==================================================

🚀 Starting LangGraph pipeline execution...

[Node 1] Analyzing video: test_1234567890
[Node 1] ✓ Video analysis complete. Category: fashion

[Node 2] Loaded 5 personas for test
[Node 2] Generating 5 reactions in parallel (max 50 concurrent)...
[Node 2] ✓ Initial reactions complete. 3/5 personas engaged

[Node 2.5] Generating dynamic social network...
[Node 2.5] ✓ Network generated: 12 connections, 2 clusters, 1 influence hubs

[Node 3] Simulating persona interactions...
[Node 3] ✓ Interactions simulated: 8 interactions, 2 sharers, max chain length: 3

[Node 4] Generating second-round reactions with social influence...
[Node 4] ✓ Second reactions complete. 1 changed reactions, 2 significantly influenced

[Node 5] Compiling final results...
[Node 5] ✓ Results compiled: 4 views, 60.0% engagement rate

==================================================
✅ PIPELINE EXECUTION COMPLETE
==================================================
Status: complete
Execution time: 45.23 seconds
Errors: 0

📊 FINAL METRICS:
  Total Views: 4
  Total Likes: 3
  Total Shares: 2
  Total Comments: 1
  Engagement Rate: 60.0%
  Personas Changed: 1
  Social Influence %: 25.0%
==================================================

💾 Results saved to: backend/test_results/test_test_1234567890_20251121_153045.json
   File size: 42.3 KB

✅ Test completed successfully!

📂 View results at: backend/test_results/test_test_1234567890_20251121_153045.json
```

## Results Output

Results are saved to `backend/test_results/` with the format:
```
{platform}_{video_id}_{timestamp}.json
```

Example:
```
test_results/test_test_1234567890_20251121_153045.json
```

### Results JSON Structure

The output file contains:
```json
{
  "video_id": "test_1234567890",
  "video_url": "/path/to/video.mp4",
  "platform": "test",
  "video_analysis": { /* detailed video analysis */ },
  "personas": [ /* all persona data */ ],
  "initial_reactions": [ /* initial reactions */ ],
  "persona_network": { /* network graph */ },
  "interaction_results": { /* interaction simulation */ },
  "interaction_events": [ /* individual interactions */ ],
  "second_reactions": [ /* updated reactions */ ],
  "final_metrics": {
    "total_views": 4,
    "total_likes": 3,
    "total_shares": 2,
    "total_comments": 1,
    "engagement_rate": 0.6,
    "personas_who_changed": 1,
    "social_influence_percentage": 0.25
  },
  "node_graph_data": { /* visualization data */ },
  "engagement_timeline": [ /* chronological events */ ],
  "reaction_insights": { /* analysis insights */ },
  "errors": [],
  "status": "complete"
}
```

## Expected Execution Times

- **Test platform (5 personas)**: ~30-60 seconds
- **Full platform (500+ personas)**: ~10-20 minutes (depending on Gemini API speed)

Bottlenecks:
- Node 2: Parallel reactions (500+ API calls)
- Node 4: Second reactions (500+ API calls)
- Network generation and interactions are single API calls

## Troubleshooting

### "GEMINI_API_KEY not found"
- Make sure `.env` file exists in `backend/` directory
- Verify `GEMINI_API_KEY` is set correctly

### "Persona file not found"
- Create the persona JSON file for your platform
- Or use `test` platform which has only 5 personas

### "Video processing failed"
- Ensure video file path is correct and accessible
- Check video format is supported by Gemini (MP4, MOV, etc.)
- Verify video file isn't corrupted

### Pipeline hangs or times out
- Check Gemini API quota/rate limits
- Reduce `GEMINI_MAX_CONCURRENT` in `.env` if hitting rate limits
- Use `test` platform first to verify everything works

## Next Steps After Testing

1. **Expand persona data** - Create 500+ diverse personas per platform
2. **Optimize prompts** - Refine XML prompts based on results
3. **Add caching** - Cache persona reactions for similar videos
4. **Background processing** - Move to async task queue for production
5. **Add WebSocket** - Real-time progress updates to frontend

## Example Test Flow

```bash
# 1. Quick sanity check with test personas
python test_pipeline.py my_video.mp4 test

# 2. Review results
cat test_results/test_*.json | jq '.final_metrics'

# 3. If successful, test with full Instagram personas
python test_pipeline.py my_video.mp4 instagram

# 4. Review detailed results
cat test_results/instagram_*.json | jq '.reaction_insights'
```

Happy testing! 🚀
