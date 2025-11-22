# Quick Start - Testing the LangGraph Pipeline

## ✅ Prerequisites

1. Make sure `.env` is configured:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Run the Test (Simple!)

The video path is already hardcoded to `videos/UGCVid1.MOV`.

Just run:

```bash
python test_pipeline.py
```

Or specify a platform:

```bash
# Quick test with 5 personas (fastest)
python test_pipeline.py test

# Instagram test with 3 personas
python test_pipeline.py instagram

# Other platforms (need persona files)
python test_pipeline.py tiktok
python test_pipeline.py twitter
python test_pipeline.py youtube
```

## 📊 What Happens

1. Loads `videos/UGCVid1.MOV`
2. Runs through all 6 LangGraph nodes:
   - Video Analysis
   - Initial Reactions (parallel)
   - Network Generation
   - Interactions
   - Second Reactions (parallel)
   - Results Compilation
3. Saves JSON results to `test_results/`

## 📁 View Results

After running, check:
```bash
ls -lh test_results/
```

Open the latest JSON file to see full results:
```bash
cat test_results/test_*.json | jq '.final_metrics'
```

## ⏱️ Expected Time

- **Test platform (5 personas)**: ~30-60 seconds
- **Instagram (3 personas)**: ~20-45 seconds

## 🎬 Using a Different Video

Edit line 26 in `test_pipeline.py`:
```python
DEFAULT_VIDEO_PATH = "/path/to/your/video.mp4"
```

Or place your video in `videos/` and update the path:
```python
DEFAULT_VIDEO_PATH = str(Path(__file__).parent / "videos" / "your_video.mp4")
```

## 🐛 Troubleshooting

**"Video file not found"**
- Make sure `videos/UGCVid1.MOV` exists
- Check: `ls -lh backend/videos/`

**"GEMINI_API_KEY not found"**
- Edit `.env` file
- Add: `GEMINI_API_KEY=your_key_here`

**"Persona file not found"**
- Use `test` platform (has 5 sample personas)
- Or create persona JSON files in `app/data/personas/`

That's it! 🎉
