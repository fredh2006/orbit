"""Reaction data models for initial and second-round reactions."""

from pydantic import BaseModel, Field
from typing import Optional


class InitialReaction(BaseModel):
    """Represents a persona's initial reaction to the video."""

    persona_id: str = Field(..., description="ID of the persona reacting")

    # Engagement decisions
    will_view: bool = Field(..., description="Whether they will view the video")
    will_like: bool = Field(default=False, description="Whether they will like")
    will_share: bool = Field(default=False, description="Whether they will share")
    will_comment: bool = Field(default=False, description="Whether they will comment")

    # Metrics
    engagement_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Overall engagement probability"
    )
    reaction_time: float = Field(
        ..., ge=0.0, description="Seconds from exposure to reaction"
    )

    # Qualitative
    reasoning: str = Field(..., description="Why they reacted this way")
    sentiment: str = Field(
        ..., description="Sentiment (positive, negative, neutral)"
    )

    # Optional comment content
    comment_text: Optional[str] = Field(
        None, description="The actual comment they would leave"
    )


class SecondReaction(BaseModel):
    """Represents a persona's second-round reaction after social influence."""

    persona_id: str = Field(..., description="ID of the persona reacting")

    # Updated engagement decisions
    will_view: bool = Field(..., description="Updated: will view")
    will_like: bool = Field(..., description="Updated: will like")
    will_share: bool = Field(..., description="Updated: will share")
    will_comment: bool = Field(..., description="Updated: will comment")

    # Influence metrics
    influence_level: float = Field(
        ..., ge=0.0, le=1.0, description="How much others influenced this reaction"
    )
    changed_from_initial: bool = Field(
        ..., description="Whether they changed their reaction"
    )

    # Social proof factors
    social_proof_factors: list[str] = Field(
        default_factory=list,
        description="Reasons for change (e.g., '5 friends shared', 'trending')",
    )

    # Qualitative
    reasoning: str = Field(..., description="Why they updated their reaction")
    updated_sentiment: str = Field(
        ..., description="Updated sentiment (positive, negative, neutral)"
    )

    # Optional updated comment
    comment_text: Optional[str] = Field(
        None, description="Updated or new comment text"
    )

    # Comparison with initial
    initial_engagement_probability: float = Field(
        ..., description="Their initial engagement probability for comparison"
    )
    final_engagement_probability: float = Field(
        ..., description="Final engagement probability after influence"
    )
