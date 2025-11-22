"""API routes for the video testing platform."""

import time
import uuid
from datetime import datetime
from typing import Dict
import shutil
import os
import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.api.schemas import (
    StartTestRequest,
    StartTestResponse,
    TestResultsResponse,
    HealthResponse,
    SendMessageRequest,
    SendMessageResponse,
    ChatMessageResponse,
    GetChatHistoryResponse,
    ChatAvailablePersonasResponse,
    PersonaAvailableForChat,
)
from app.graph.graph import video_test_graph
from app.graph.state import VideoTestState
from app.services.chat_service import chat_service
from app.models.chat import ChatMessage


router = APIRouter()

# Ensure videos directory exists
VIDEOS_DIR = Path("videos")
VIDEOS_DIR.mkdir(exist_ok=True)

# Ensure test_results directory exists
TEST_RESULTS_DIR = Path("test_results")
TEST_RESULTS_DIR.mkdir(exist_ok=True)

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


def load_test_results_from_files():
    """Load test results from JSON files in test_results directory."""
    global test_results_store

    json_files = list(TEST_RESULTS_DIR.glob("*.json"))

    for json_file in json_files:
        try:
            with open(json_file, "r") as f:
                state = json.load(f)

            # Extract test ID from filename or state
            test_id = state.get("video_id", json_file.stem)

            # Store in memory
            test_results_store[test_id] = {
                "test_id": test_id,
                "start_time": time.time(),  # Use current time as placeholder
                "state": state,
            }

            print(f"Loaded test result: {test_id} from {json_file.name}")
        except Exception as e:
            print(f"Error loading {json_file}: {e}")


# Load existing test results on module import
load_test_results_from_files()


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
            "user_context": request.user_context,
            "platform_metrics": request.platform_metrics,
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
        print(f"User Context: {request.user_context}")
        print(f"Platform Metrics: {request.platform_metrics}")
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


@router.get("/test-results/latest")
async def get_latest_test_results():
    """Get the latest test results for visualization.

    Returns:
        Complete test state including personas, reactions, and interactions
    """
    if not test_results_store:
        raise HTTPException(status_code=404, detail="No test results available")

    # Get the most recent test
    latest_test_id = max(test_results_store.keys(), key=lambda k: test_results_store[k].get("start_time", 0))
    latest_test = test_results_store[latest_test_id]
    state = latest_test["state"]

    # Return the complete state for visualization
    return {
        "test_id": latest_test_id,
        "video_id": state.get("video_id"),
        "video_url": state.get("video_url"),
        "platform": state.get("platform"),
        "personas": state.get("personas", []),
        "initial_reactions": state.get("initial_reactions", []),
        "second_reactions": state.get("second_reactions", []),
        "interaction_events": state.get("interaction_events", []),
        "persona_network": state.get("persona_network", {}),
        "final_metrics": state.get("final_metrics", {}),
        "status": state.get("status"),
        "errors": state.get("errors", []),
    }


# ============================================================================
# Chat Endpoints
# ============================================================================


@router.get("/test/{test_id}/chat/personas", response_model=ChatAvailablePersonasResponse)
async def get_available_personas(test_id: str):
    """Get list of personas available for chat in a completed test.

    Args:
        test_id: The test identifier

    Returns:
        List of personas with their reaction summaries
    """
    if test_id not in test_results_store:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

    test_data = test_results_store[test_id]
    state = test_data.get("state", {})

    # Check test is complete
    if state.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Test {test_id} is not completed. Chat is only available for completed tests.",
        )

    personas = state.get("personas", [])
    initial_reactions = state.get("initial_reactions", [])
    second_reactions = state.get("second_reactions", [])

    # Build response
    available_personas = []
    chat_histories = test_data.get("chat_histories", {})

    for persona in personas:
        persona_id = persona.get("persona_id")

        # Find reactions for this persona
        initial = next(
            (r for r in initial_reactions if r.get("persona_id") == persona_id), {}
        )
        second = next(
            (r for r in second_reactions if r.get("persona_id") == persona_id), {}
        )

        # Build reaction summaries
        initial_summary = _build_reaction_summary(initial)
        second_summary = _build_second_reaction_summary(second)

        # Get message count
        message_count = 0
        if persona_id in chat_histories:
            message_count = len(chat_histories[persona_id].messages)

        available_personas.append(
            PersonaAvailableForChat(
                persona_id=persona_id,
                name=persona.get("name", "Unknown"),
                age=persona.get("age", 0),
                occupation=persona.get("occupation", "Unknown"),
                initial_reaction_summary=initial_summary,
                second_reaction_summary=second_summary,
                message_count=message_count,
            )
        )

    return ChatAvailablePersonasResponse(test_id=test_id, personas=available_personas)


@router.post(
    "/test/{test_id}/chat/{persona_id}/message", response_model=SendMessageResponse
)
async def send_message(test_id: str, persona_id: str, request: SendMessageRequest):
    """Send a message to a persona and get their response.

    Args:
        test_id: The test identifier
        persona_id: The persona identifier
        request: Message request with user's message

    Returns:
        Persona's response message
    """
    # Validate chat is available
    is_valid, error_msg = chat_service.validate_chat_availability(
        test_results_store, test_id, persona_id
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Get or create chat history
    chat_history = chat_service.get_or_create_chat_history(
        test_results_store, test_id, persona_id
    )

    # Get state data for context
    state = test_results_store[test_id]["state"]
    personas = state.get("personas", [])
    persona = next((p for p in personas if p.get("persona_id") == persona_id), None)

    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona {persona_id} not found")

    # Find reactions
    initial_reactions = state.get("initial_reactions", [])
    second_reactions = state.get("second_reactions", [])

    initial_reaction = next(
        (r for r in initial_reactions if r.get("persona_id") == persona_id), None
    )
    second_reaction = next(
        (r for r in second_reactions if r.get("persona_id") == persona_id), None
    )

    # Build context
    context = chat_service.build_persona_context(
        persona=persona,
        video_analysis=state.get("video_analysis"),
        initial_reaction=initial_reaction,
        second_reaction=second_reaction,
        persona_network=state.get("persona_network"),
    )

    # Generate response
    try:
        response_text = await chat_service.generate_persona_response(
            context=context, chat_history=chat_history, user_message=request.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate response: {str(e)}"
        )

    # Add messages to history
    user_msg = ChatMessage(role="user", content=request.message)
    assistant_msg = ChatMessage(role="assistant", content=response_text)

    chat_history.messages.append(user_msg)
    chat_history.messages.append(assistant_msg)
    chat_history.updated_at = datetime.now()

    # Return response
    return SendMessageResponse(
        message=ChatMessageResponse(
            role="assistant",
            content=response_text,
            timestamp=assistant_msg.timestamp.isoformat(),
        ),
        conversation_length=len(chat_history.messages),
    )


@router.post("/test/{test_id}/chat/{persona_id}/stream")
async def stream_message(test_id: str, persona_id: str, request: SendMessageRequest):
    """Send a message to a persona and stream their response.

    Args:
        test_id: The test identifier
        persona_id: The persona identifier
        request: Message request with user's message

    Returns:
        Streaming response with persona's message
    """
    # Validate chat is available
    is_valid, error_msg = chat_service.validate_chat_availability(
        test_results_store, test_id, persona_id
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Get or create chat history
    chat_history = chat_service.get_or_create_chat_history(
        test_results_store, test_id, persona_id
    )

    # Get state data for context
    state = test_results_store[test_id]["state"]
    personas = state.get("personas", [])
    persona = next((p for p in personas if p.get("persona_id") == persona_id), None)

    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona {persona_id} not found")

    # Find reactions
    initial_reactions = state.get("initial_reactions", [])
    second_reactions = state.get("second_reactions", [])

    initial_reaction = next(
        (r for r in initial_reactions if r.get("persona_id") == persona_id), None
    )
    second_reaction = next(
        (r for r in second_reactions if r.get("persona_id") == persona_id), None
    )

    # Build context
    context = chat_service.build_persona_context(
        persona=persona,
        video_analysis=state.get("video_analysis"),
        initial_reaction=initial_reaction,
        second_reaction=second_reaction,
        persona_network=state.get("persona_network"),
    )

    # Stream response
    async def generate():
        """Generate streaming response."""
        full_response = ""
        try:
            async for chunk in chat_service.stream_persona_response(
                context=context, chat_history=chat_history, user_message=request.message
            ):
                full_response += chunk
                yield f"data: {chunk}\n\n"

            # Signal end of stream
            yield "data: [DONE]\n\n"

            # Save messages to history after streaming completes
            user_msg = ChatMessage(role="user", content=request.message)
            assistant_msg = ChatMessage(role="assistant", content=full_response)

            chat_history.messages.append(user_msg)
            chat_history.messages.append(assistant_msg)
            chat_history.updated_at = datetime.now()

        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get(
    "/test/{test_id}/chat/{persona_id}/history", response_model=GetChatHistoryResponse
)
async def get_chat_history(test_id: str, persona_id: str):
    """Get the full chat history with a persona.

    Args:
        test_id: The test identifier
        persona_id: The persona identifier

    Returns:
        Complete conversation history
    """
    # Validate chat is available
    is_valid, error_msg = chat_service.validate_chat_availability(
        test_results_store, test_id, persona_id
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Get chat history
    chat_history = chat_service.get_or_create_chat_history(
        test_results_store, test_id, persona_id
    )

    # Get persona name
    state = test_results_store[test_id]["state"]
    personas = state.get("personas", [])
    persona = next((p for p in personas if p.get("persona_id") == persona_id), None)
    persona_name = persona.get("name", "Unknown") if persona else "Unknown"

    # Convert messages to response format
    messages = [
        ChatMessageResponse(
            role=msg.role, content=msg.content, timestamp=msg.timestamp.isoformat()
        )
        for msg in chat_history.messages
    ]

    return GetChatHistoryResponse(
        test_id=test_id,
        persona_id=persona_id,
        persona_name=persona_name,
        messages=messages,
        created_at=chat_history.created_at.isoformat(),
        updated_at=chat_history.updated_at.isoformat(),
    )


@router.delete("/test/{test_id}/chat/{persona_id}/history")
async def clear_chat_history(test_id: str, persona_id: str):
    """Clear the chat history with a persona.

    Args:
        test_id: The test identifier
        persona_id: The persona identifier

    Returns:
        Success message
    """
    if test_id not in test_results_store:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

    test_data = test_results_store[test_id]

    if "chat_histories" in test_data and persona_id in test_data["chat_histories"]:
        del test_data["chat_histories"][persona_id]

    return {"message": f"Chat history cleared for persona {persona_id}", "test_id": test_id}


# ============================================================================
# Helper Functions
# ============================================================================


def _build_reaction_summary(reaction: dict) -> str:
    """Build a human-readable summary of a reaction.

    Args:
        reaction: Reaction data

    Returns:
        Summary string
    """
    if not reaction:
        return "No reaction recorded"

    actions = []
    if reaction.get("will_like"):
        actions.append("liked")
    if reaction.get("will_share"):
        actions.append("shared")
    if reaction.get("will_comment"):
        actions.append("commented")

    if not actions:
        return f"{reaction.get('sentiment', 'Neutral')} - did not engage"

    return f"{reaction.get('sentiment', 'Neutral')} - {', '.join(actions)}"


def _build_second_reaction_summary(reaction: dict) -> str:
    """Build a summary of second reaction showing changes.

    Args:
        reaction: Second reaction data

    Returns:
        Summary string
    """
    if not reaction:
        return "No second reaction recorded"

    actions = []
    if reaction.get("will_like"):
        actions.append("liked")
    if reaction.get("will_share"):
        actions.append("shared")
    if reaction.get("will_comment"):
        actions.append("commented")

    changed = reaction.get("changed_from_initial", False)
    change_indicator = " (changed)" if changed else ""

    if not actions:
        return f"{reaction.get('updated_sentiment', 'Neutral')} - did not engage{change_indicator}"

    return f"{reaction.get('updated_sentiment', 'Neutral')} - {', '.join(actions)}{change_indicator}"
