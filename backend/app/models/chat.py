"""Chat data models for persona conversations."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """Represents a single message in a persona conversation."""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="The message content")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="When the message was sent"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Why did you decide to share this video?",
                "timestamp": "2024-11-22T10:30:00",
            }
        }


class ChatHistory(BaseModel):
    """Collection of messages for a persona conversation."""

    test_id: str = Field(..., description="Test identifier")
    persona_id: str = Field(..., description="Persona identifier")
    messages: List[ChatMessage] = Field(
        default_factory=list, description="Ordered list of messages"
    )
    created_at: datetime = Field(
        default_factory=datetime.now, description="When the conversation started"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, description="When last message was added"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "test_id": "abc-123",
                "persona_id": "persona_001",
                "messages": [
                    {
                        "role": "user",
                        "content": "Why did you share this?",
                        "timestamp": "2024-11-22T10:30:00",
                    },
                    {
                        "role": "assistant",
                        "content": "I shared it because...",
                        "timestamp": "2024-11-22T10:30:05",
                    },
                ],
                "created_at": "2024-11-22T10:30:00",
                "updated_at": "2024-11-22T10:30:05",
            }
        }


class ChatContext(BaseModel):
    """Aggregated context for persona chat (persona + video + reactions)."""

    persona: dict = Field(..., description="Persona profile data")
    video_analysis: Optional[dict] = Field(None, description="Video analysis results")
    initial_reaction: Optional[dict] = Field(
        None, description="Persona's initial reaction"
    )
    second_reaction: Optional[dict] = Field(
        None, description="Persona's reaction after social influence"
    )
    network_context: Optional[dict] = Field(
        None, description="Social network context (friends, trends)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "persona": {
                    "persona_id": "persona_001",
                    "name": "Sarah Martinez",
                    "age": 28,
                    "interests": ["fashion", "photography"],
                },
                "video_analysis": {
                    "content_type": "fashion tutorial",
                    "sentiment": "positive",
                },
                "initial_reaction": {
                    "will_like": True,
                    "will_share": False,
                    "reasoning": "Loved the styling tips",
                },
                "second_reaction": {
                    "will_share": True,
                    "changed_from_initial": True,
                    "reasoning": "Saw 3 friends shared it",
                },
            }
        }
