"""API routes for the video testing platform."""

import time
import uuid
from typing import Dict
import shutil
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File

from app.api.schemas import (
    StartTestRequest,
    StartTestResponse,
    TestResultsResponse,
    HealthResponse,
)
from app.graph.graph import video_test_graph
from app.graph.state import VideoTestState


router = APIRouter()

# Ensure videos directory exists
VIDEOS_DIR = Path("videos")
VIDEOS_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file."""
    try:
        # Generate unique filename to prevent overwrites
        file_extension = Path(file.filename).suffix
        video_id = str(uuid.uuid4())
        new_filename = f"{video_id}{file_extension}"
        file_path = VIDEOS_DIR / new_filename
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "video_id": video_id,
            "video_url": str(file_path.absolute()),
            "filename": new_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload video: {str(e)}")

# In-memory storage for test results (in production, use a database)
test_results_store: Dict[str, dict] = {}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")


@router.post("/test/start", response_model=StartTestResponse)
async def start_test(request: StartTestRequest):
    """Start a new video test simulation.

    This endpoint initiates the 6-node LangGraph pipeline:
    1. Video Analysis
    2. Initial Reactions (parallel)
    3. Network Generation
    4. Interactions
    5. Second Reactions (parallel)
    6. Results Compilation

    Args:
        request: Test configuration

    Returns:
        Test ID and status
    """
    try:
        # Generate unique test ID
        test_id = str(uuid.uuid4())

        # Create initial state
        initial_state: VideoTestState = {
            "video_id": request.video_id,
            "video_url": request.video_url,
            "platform": request.platform,
            "simulation_params": request.simulation_params or {},
            "video_analysis": None,
            "personas": None,
            "initial_reactions": None,
            "persona_network": None,
            "interaction_results": None,
            "interaction_events": None,
            "second_reactions": None,
            "final_metrics": None,
            "node_graph_data": None,
            "engagement_timeline": None,
            "reaction_insights": None,
            "errors": [],
            "status": "initializing",
        }

        # Store initial state
        test_results_store[test_id] = {
            "test_id": test_id,
            "start_time": time.time(),
            "state": initial_state,
        }

        print(f"\n{'='*60}")
        print(f"Starting new test: {test_id}")
        print(f"Video: {request.video_id}")
        print(f"Platform: {request.platform}")
        print(f"{'='*60}\n")

        # Run the graph asynchronously
        # Note: In production, this should be run in a background task
        # For now, we'll run it directly (may cause timeout for large simulations)
        final_state = await video_test_graph.ainvoke(initial_state)

        # Store final results
        test_results_store[test_id]["state"] = final_state
        test_results_store[test_id]["end_time"] = time.time()
        test_results_store[test_id]["duration"] = (
            test_results_store[test_id]["end_time"]
            - test_results_store[test_id]["start_time"]
        )

        print(f"\n{'='*60}")
        print(f"Test complete: {test_id}")
        print(f"Status: {final_state.get('status')}")
        print(f"Duration: {test_results_store[test_id]['duration']:.2f}s")
        print(f"{'='*60}\n")

        return StartTestResponse(
            test_id=test_id,
            status=final_state.get("status", "unknown"),
            message=f"Test completed with status: {final_state.get('status')}",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start test: {str(e)}")


@router.get("/test/{test_id}", response_model=TestResultsResponse)
async def get_test_results(test_id: str):
    """Get results for a specific test.

    Args:
        test_id: The test identifier

    Returns:
        Complete test results
    """
    if test_id not in test_results_store:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

    test_data = test_results_store[test_id]
    state = test_data["state"]

    return TestResultsResponse(
        test_id=test_id,
        video_id=state.get("video_id"),
        platform=state.get("platform"),
        status=state.get("status"),
        final_metrics=state.get("final_metrics"),
        node_graph_data=state.get("node_graph_data"),
        engagement_timeline=state.get("engagement_timeline"),
        reaction_insights=state.get("reaction_insights"),
        simulation_duration=test_data.get("duration"),
        persona_count=len(state.get("personas", [])),
        errors=state.get("errors", []),
    )


@router.get("/test/{test_id}/status")
async def get_test_status(test_id: str):
    """Get the current status of a test.

    Args:
        test_id: The test identifier

    Returns:
        Current status information
    """
    if test_id not in test_results_store:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

    state = test_results_store[test_id]["state"]

    return {
        "test_id": test_id,
        "status": state.get("status"),
        "errors": state.get("errors", []),
    }
