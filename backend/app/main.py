"""Main FastAPI application."""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from app.api.routes import router, test_results_store
from app.config import settings


# Create FastAPI app
app = FastAPI(
    title="UGC Video Testing Platform API",
    description="LangGraph-powered backend for simulating video performance across social media platforms",
    version="1.0.0",
)


# Configure CORS
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all uncaught exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc),
        },
    )


# Include API routes
app.include_router(router, prefix="/api/v1", tags=["video-testing"])


def load_demo_test_data():
    """Load demo test data from frontend/public/test-data.json if it exists."""
    try:
        # Try to find the test-data.json file
        # Look in parent directory's frontend/public folder
        backend_dir = Path(__file__).parent.parent
        project_root = backend_dir.parent
        test_data_path = project_root / "frontend" / "public" / "test-data.json"

        if test_data_path.exists():
            print(f"Loading demo test data from: {test_data_path}")

            with open(test_data_path, "r") as f:
                test_data = json.load(f)

            # Extract test_id from the data
            test_id = test_data.get("test_id")

            if test_id:
                # Store the test data in test_results_store
                test_results_store[test_id] = {
                    "test_id": test_id,
                    "start_time": 0,
                    "end_time": 0,
                    "duration": 0,
                    "state": {
                        **test_data,
                        "status": "completed",  # Mark as completed so chat works
                    },
                    "chat_histories": {}  # Initialize empty chat histories
                }

                print(f"✓ Demo test loaded successfully with ID: {test_id}")
                print(f"  - Personas: {len(test_data.get('personas', []))}")
                print(f"  - Interactions: {len(test_data.get('interaction_events', []))}")
                print(f"  - Chat is now available for this test\n")
            else:
                print("⚠ No test_id found in test-data.json")
        else:
            print(f"ℹ No demo test data found at: {test_data_path}")
            print("  Chat will only work with tests created via API\n")

    except Exception as e:
        print(f"⚠ Error loading demo test data: {e}\n")


# Video serving endpoint (not under /api/v1 prefix)
VIDEOS_DIR = Path("videos")
VIDEOS_DIR.mkdir(exist_ok=True)


@app.get("/videos/{filename}")
async def serve_video(filename: str):
    """Serve a video file."""
    file_path = VIDEOS_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(file_path)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "UGC Video Testing Platform API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print("\n" + "="*60)
    print("UGC Video Testing Platform - Backend Starting")
    print("="*60)
    print(f"API Host: {settings.API_HOST}")
    print(f"API Port: {settings.API_PORT}")
    print(f"Gemini Model: {settings.GEMINI_MODEL}")
    print(f"Max Concurrent API Calls: {settings.GEMINI_MAX_CONCURRENT}")
    print("="*60 + "\n")

    # Load demo test data if it exists
    load_demo_test_data()


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("\n" + "="*60)
    print("UGC Video Testing Platform - Backend Shutting Down")
    print("="*60 + "\n")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
    )
