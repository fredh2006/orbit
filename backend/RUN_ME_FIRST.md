# 🚀 HOW TO RUN THE TEST

## ✅ Everything is already set up! Just run:

```bash
./run_test.sh
```

That's it! The script will automatically:
- Use the virtual environment
- Check all dependencies
- Run the test with your video

---

## 🎯 Quick Commands

```bash
# Run with test platform (5 personas - fastest)
./run_test.sh

# Run with test platform explicitly
./run_test.sh test

# Run with Instagram (3 personas)
./run_test.sh instagram
```

---

## 🐛 If you get "command not found"

Make the script executable first:
```bash
chmod +x run_test.sh
./run_test.sh
```

---

## 🔍 Check your setup

Run the diagnostic:
```bash
venv/bin/python check_setup.py
```

---

## ⚠️ IMPORTANT: Don't run with system Python!

❌ **WRONG** (will give ModuleNotFoundError):
```bash
python test_pipeline.py          # Don't do this
python3 test_pipeline.py         # Don't do this
/opt/homebrew/bin/python3.12 test_pipeline.py  # Don't do this
```

✅ **CORRECT** (uses venv with all dependencies):
```bash
./run_test.sh                    # Do this
venv/bin/python test_pipeline.py # Or this
```

---

## 📁 What was fixed in .gitignore

The following are now properly ignored:
- ✅ `venv/` - Virtual environment (HUGE, don't commit!)
- ✅ `__pycache__/` - Python cache files
- ✅ `*.pyc` - Compiled Python files
- ✅ `test_results/*.json` - Test output files
- ✅ `videos/*.MOV` - Video files
- ✅ `.env` - Environment secrets
- ✅ `.DS_Store` - macOS files
- ✅ IDE files (.vscode, .idea)
- ✅ Log files

---

## 📊 Expected Output

When you run `./run_test.sh`, you'll see:

```
🚀 LangGraph Pipeline Test Runner
==================================

✓ All prerequisites met

Running test with platform: test
Video: videos/UGCVid1.MOV

======================================================================
LANGGRAPH VIDEO TESTING PIPELINE - TEST RUN
======================================================================
Video: /Users/bt/Documents/GitHub/orbit/backend/videos/UGCVid1.MOV
Platform: test
Test started: 2025-11-22 12:00:00
======================================================================

🚀 Starting LangGraph pipeline execution...

[Node 1] Analyzing video: test_1234567890
[Node 1] ✓ Video analysis complete...
[Node 2] Loaded 5 personas for test
[Node 2] ✓ Initial reactions complete...
... etc ...
```

Results will be saved to: `test_results/{platform}_{timestamp}.json`

---

## 🎬 Ready? Just run:

```bash
./run_test.sh
```

🚀 That's all you need!
