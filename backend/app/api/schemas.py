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
