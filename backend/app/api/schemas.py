"""API request and response schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List


class StartTestRequest(BaseModel):
    """Request to start a new video test."""

    video_id: str = Field(..., description="Unique identifier for the video")
    video_url: str = Field(..., description="URL or path to the video file")
    platform: str = Field(
        ..., description="Platform to test on (instagram, tiktok, twitter, youtube)"
    )
    simulation_params: Optional[dict] = Field(
        default_factory=dict, description="Optional simulation parameters"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "video_id": "test_video_001",
                "video_url": "/path/to/video.mp4",
                "platform": "instagram",
                "simulation_params": {},
            }
        }


class StartTestResponse(BaseModel):
    """Response after starting a test."""

    test_id: str = Field(..., description="Unique identifier for this test run")
    status: str = Field(..., description="Current status")
    message: str = Field(..., description="Status message")


class TestResultsResponse(BaseModel):
    """Complete test results."""

    test_id: str
    video_id: str
    platform: str
    status: str
    final_metrics: Optional[dict] = None
    node_graph_data: Optional[dict] = None
    engagement_timeline: Optional[List[dict]] = None
    reaction_insights: Optional[dict] = None
    simulation_duration: Optional[float] = None
    persona_count: Optional[int] = None
    errors: List[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")


class SendMessageRequest(BaseModel):
    """Request to send a message to a persona."""

    message: str = Field(..., description="The user's message to the persona")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Why did you decide to share this video with your friends?"
            }
        }


class ChatMessageResponse(BaseModel):
    """Response containing a chat message."""

    role: str = Field(..., description="Message role (user or assistant)")
    content: str = Field(..., description="Message content")
    timestamp: str = Field(..., description="ISO timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "role": "assistant",
                "content": "I shared it because it really resonated with my interests in fashion...",
                "timestamp": "2024-11-22T10:30:05",
            }
        }


class SendMessageResponse(BaseModel):
    """Response after sending a message to a persona."""

    message: ChatMessageResponse = Field(..., description="The persona's response")
    conversation_length: int = Field(
        ..., description="Total messages in conversation"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": {
                    "role": "assistant",
                    "content": "I shared it because...",
                    "timestamp": "2024-11-22T10:30:05",
                },
                "conversation_length": 4,
            }
        }


class GetChatHistoryResponse(BaseModel):
    """Response containing full chat history."""

    test_id: str = Field(..., description="Test identifier")
    persona_id: str = Field(..., description="Persona identifier")
    persona_name: str = Field(..., description="Persona name for display")
    messages: List[ChatMessageResponse] = Field(..., description="All messages")
    created_at: str = Field(..., description="When conversation started")
    updated_at: str = Field(..., description="When last updated")

    class Config:
        json_schema_extra = {
            "example": {
                "test_id": "abc-123",
                "persona_id": "persona_001",
                "persona_name": "Sarah Martinez",
                "messages": [],
                "created_at": "2024-11-22T10:30:00",
                "updated_at": "2024-11-22T10:35:00",
            }
        }


class PersonaAvailableForChat(BaseModel):
    """A persona available for chatting."""

    persona_id: str = Field(..., description="Persona identifier")
    name: str = Field(..., description="Persona name")
    age: int = Field(..., description="Persona age")
    occupation: str = Field(..., description="Persona occupation")
    initial_reaction_summary: str = Field(
        ..., description="Brief summary of their initial reaction"
    )
    second_reaction_summary: str = Field(
        ..., description="Brief summary of their influenced reaction"
    )
    message_count: int = Field(
        default=0, description="Number of messages in conversation"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "persona_id": "persona_001",
                "name": "Sarah Martinez",
                "age": 28,
                "occupation": "Fashion Designer",
                "initial_reaction_summary": "Liked the video",
                "second_reaction_summary": "Decided to share after seeing friends engage",
                "message_count": 0,
            }
        }


class ChatAvailablePersonasResponse(BaseModel):
    """Response listing personas available for chat."""

    test_id: str = Field(..., description="Test identifier")
    personas: List[PersonaAvailableForChat] = Field(
        ..., description="List of personas"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "test_id": "abc-123",
                "personas": [
                    {
                        "persona_id": "persona_001",
                        "name": "Sarah Martinez",
                        "age": 28,
                        "occupation": "Fashion Designer",
                        "initial_reaction_summary": "Liked the video",
                        "second_reaction_summary": "Shared after social influence",
                        "message_count": 0,
                    }
                ],
            }
        }
