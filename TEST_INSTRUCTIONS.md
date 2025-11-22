# LinkedIn Text Post Testing Instructions

## Quick Start

### Run the Test Script

The test script runs **directly** (no API server needed):

```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
python test_linkedin_text.py
```

Or test X/Twitter posts:

```bash
python test_linkedin_text.py x
```

## What the Test Does

The script tests the complete text post analysis pipeline:

1. **Uses a hardcoded LinkedIn or X post** (product launch announcement)
2. **Runs the LangGraph pipeline directly** (no API server needed)
3. **Routes to text_analysis node** instead of video_analysis
4. **Loads platform-specific personas** (LinkedIn or X)
5. **Displays comprehensive results** including:
   - Text analysis (sentiment, topics, engagement potential)
   - Persona reactions
   - Final metrics
   - Platform predictions
6. **Saves full results** to `backend/test_results/` directory

## Hardcoded Post

The test uses this LinkedIn post:

```
Excited to share that our team just launched a revolutionary AI-powered analytics platform!

After 8 months of hard work, we've built something that reduces data analysis time by 70%.
Our beta users are already seeing incredible results.

Key features:
✅ Real-time insights
✅ Automated reporting
✅ Predictive analytics
✅ Seamless integrations

Huge shoutout to the amazing team who made this possible. This is just the beginning!

Interested in learning more? Drop a comment or DM me.

#AI #Analytics #ProductLaunch #Innovation #TechStartup
```

## Expected Output

```
======================================================================
LANGGRAPH TEXT POST TESTING PIPELINE - TEST RUN
======================================================================
Platform: linkedin
Content type: text
Test started: 2025-11-22 15:30:45
======================================================================

📝 Post Content:
----------------------------------------------------------------------
[LinkedIn post content...]
----------------------------------------------------------------------

🚀 Starting LangGraph pipeline execution...

[Node 1 - Text] Analyzing text post: text_linkedin_1732309845
[Node 1 - Text] Platform: linkedin
[Node 1 - Text] ✓ Text analysis complete. Category: business
[Node 2] Generating initial reactions...
[Node 2] Platform selected: linkedin
[Node 2] ✓ Successfully loaded 20 personas for linkedin
[... pipeline execution continues ...]

======================================================================
✅ PIPELINE EXECUTION COMPLETE
======================================================================
Status: completed
Execution time: 45.32 seconds
Errors: 0

📝 TEXT ANALYSIS:
  Category: business
  Topics: product launch, AI, analytics, innovation
  Sentiment: positive
  Mood: enthusiastic
  Hook Strength: 75/100
  Shareability: 70/100

💬 INITIAL REACTIONS:
  Total personas: 20
  Engaged: 15/20 (75.0%)

📊 FINAL METRICS:
  Total Views: 1,234
  Total Likes: 89
  Total Shares: 12
  Total Comments: 23
  Engagement Rate: 12.5%
  Personas Changed: 8
  Social Influence %: 40.0%

🎯 PLATFORM PREDICTIONS:
  Virality Score: 7/10
  Predicted Reach: medium-high
======================================================================

💾 Results saved to: backend/test_results/linkedin_text_text_linkedin_1732309845_20251122_153045.json
   File size: 125.4 KB

✅ Test completed successfully!

📂 View results at: backend/test_results/linkedin_text_text_linkedin_1732309845_20251122_153045.json

======================================================================
QUICK SUMMARY
======================================================================
Platform: linkedin
Personas tested: 20
Engagement rate: 12.5%
Social influence impact: 40.0%
Content category: business
Sentiment: positive
======================================================================
```

## Troubleshooting

### Missing API Key
```
❌ Error: API key not configured
```
**Solution:** Make sure `GEMINI_API_KEY` is set in `backend/.env`

### Module not found
```
ModuleNotFoundError: No module named 'app'
```
**Solution:** Make sure you're running the script from the `backend/` directory

### Persona files not found
```
❌ Error: Persona file not found: backend/app/data/personas/linkedin.json
```
**Solution:** Make sure the persona JSON files exist in `backend/app/data/personas/`

### Pipeline execution failed
```
❌ PIPELINE EXECUTION FAILED
Error: ...
```
**Solution:** Check the error message. Common issues:
- API rate limits exceeded
- Invalid JSON in persona files
- Missing dependencies

## Customizing the Test

Edit `backend/test_linkedin_text.py` to change:

- **LINKEDIN_POST**: Change the LinkedIn text content
- **X_POST**: Change the X/Twitter text content
- **platform_metrics**: Modify follower counts in the `run_test()` function
- **user_context**: Change user name/email in the `run_test()` function

## Comparing with Video Tests

This test is similar to `test_pipeline.py` but for text content:

| Feature | test_pipeline.py | test_linkedin_text.py |
|---------|------------------|----------------------|
| Content Type | Video | Text |
| First Node | video_analysis | text_analysis |
| Input | Video file path | Text string |
| Platforms | instagram, tiktok | linkedin, x |
