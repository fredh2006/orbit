"""Results data models for final compilation and output."""

from pydantic import BaseModel, Field
from typing import List, Optional


class FinalMetrics(BaseModel):
    """Aggregated metrics from the simulation."""

    # Engagement totals
    total_views: int = Field(..., description="Total personas who viewed")
    total_likes: int = Field(..., description="Total personas who liked")
    total_shares: int = Field(..., description="Total personas who shared")
    total_comments: int = Field(..., description="Total personas who commented")

    # Rates
    view_rate: float = Field(..., ge=0.0, le=1.0, description="Views / total personas")
    engagement_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Engaged personas / total personas"
    )
    viral_coefficient: float = Field(
        ..., description="Average shares per sharer (viral growth indicator)"
    )

    # Reaction shift analysis
    personas_who_changed: int = Field(
        ..., description="Number who changed reaction after social influence"
    )
    change_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Percentage who changed their minds"
    )

    # Social influence impact
    social_influence_engagement: int = Field(
        ..., description="Engagement driven by social proof (not organic)"
    )
    social_influence_percentage: float = Field(
        ..., ge=0.0, le=1.0, description="% of engagement from social influence"
    )

    # Time-series
    peak_engagement_time: float = Field(
        ..., description="Time (seconds) when engagement peaked"
    )
    time_to_viral: Optional[float] = Field(
        None, description="Time to reach viral threshold (if applicable)"
    )


class NodeGraphData(BaseModel):
    """Data for visualizing the persona network graph."""

    nodes: List[dict] = Field(..., description="Node data for visualization")
    edges: List[dict] = Field(..., description="Edge data for visualization")
    clusters: List[dict] = Field(..., description="Cluster/community data")
    influence_hubs: List[str] = Field(..., description="IDs of influential personas")

    class Config:
        json_schema_extra = {
            "example": {
                "nodes": [
                    {
                        "id": "persona_001",
                        "name": "Sarah Martinez",
                        "x": 100,
                        "y": 200,
                        "engaged": True,
                        "influenced": False,
                        "sentiment": "positive",
                    }
                ],
                "edges": [
                    {
                        "source": "persona_001",
                        "target": "persona_002",
                        "strength": 0.8,
                        "interaction_occurred": True,
                    }
                ],
                "clusters": [
                    {
                        "id": "fashion_la",
                        "members": ["persona_001", "persona_002"],
                        "color": "#FF5733",
                    }
                ],
                "influence_hubs": ["persona_001"],
            }
        }


class TimelineEvent(BaseModel):
    """Single event in the engagement timeline."""

    timestamp: float = Field(..., description="Time in seconds from start")
    event_type: str = Field(
        ..., description="Type of event (view, like, share, comment, interaction)"
    )
    persona_id: str = Field(..., description="Persona involved")
    details: dict = Field(default_factory=dict, description="Additional event details")


class ReactionInsights(BaseModel):
    """Insights comparing initial vs influenced reactions."""

    # Most influenced
    most_influenced_personas: List[str] = Field(
        ..., description="Personas most affected by social influence"
    )
    most_resistant_personas: List[str] = Field(
        ..., description="Personas who didn't change reactions"
    )

    # Patterns
    influenced_demographics: dict = Field(
        default_factory=dict,
        description="Which demographic groups were most influenced",
    )
    platform_specific_patterns: dict = Field(
        default_factory=dict,
        description="Platform-specific engagement patterns",
    )

    # Sentiment analysis
    sentiment_shifts: dict = Field(
        default_factory=dict,
        description="How sentiment changed (positive->negative, etc.)",
    )
    avg_sentiment_change: float = Field(
        ..., description="Average sentiment shift (-1.0 to 1.0)"
    )

    # Content performance
    content_strengths: List[str] = Field(
        ..., description="What aspects of content performed well"
    )
    content_weaknesses: List[str] = Field(
        ..., description="What aspects of content underperformed"
    )


class CompiledResults(BaseModel):
    """Complete results package from the simulation."""

    video_id: str = Field(..., description="ID of tested video")
    platform: str = Field(..., description="Platform tested on")

    # Main result components
    final_metrics: FinalMetrics
    node_graph_data: NodeGraphData
    engagement_timeline: List[TimelineEvent]
    reaction_insights: ReactionInsights

    # Metadata
    simulation_duration: float = Field(..., description="Total simulation time (seconds)")
    persona_count: int = Field(..., description="Number of personas simulated")
    success: bool = Field(..., description="Whether simulation completed successfully")
    errors: List[str] = Field(default_factory=list, description="Any errors encountered")
