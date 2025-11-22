#!/bin/bash

# Simple script to run the test pipeline with the correct Python environment

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 LangGraph Pipeline Test Runner${NC}"
echo "=================================="
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Creating virtual environment..."
    /opt/homebrew/bin/python3.12 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
    echo ""
fi

# Check if dependencies are installed
if ! venv/bin/python -c "import langgraph" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "Installing dependencies..."
    venv/bin/pip install -q -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create a .env file with your GEMINI_API_KEY"
    echo "Example:"
    echo "  cp .env.example .env"
    echo "  # Then edit .env and add your API key"
    exit 1
fi

# Check if API key is set
if ! grep -q "GEMINI_API_KEY=AI" .env 2>/dev/null; then
    echo -e "${RED}❌ GEMINI_API_KEY not set in .env file!${NC}"
    echo "Please add your Gemini API key to .env"
    exit 1
fi

# Check if video exists
if [ ! -f "videos/UGCVid1.MOV" ]; then
    echo -e "${RED}❌ Video file not found: videos/UGCVid1.MOV${NC}"
    echo "Please place a video file at: videos/UGCVid1.MOV"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Get platform argument (default: test)
PLATFORM=${1:-test}

echo "Running test with platform: ${PLATFORM}"
echo "Video: videos/UGCVid1.MOV"
echo ""

# Run the test
venv/bin/python test_pipeline.py "$PLATFORM"
