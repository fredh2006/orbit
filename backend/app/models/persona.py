"""Persona data model."""

from pydantic import BaseModel, Field
from typing import List, Optional


class Persona(BaseModel):
    """Represents a single persona in the simulation."""

    persona_id: str = Field(..., description="Unique identifier for the persona")
    name: str = Field(..., description="Persona name")
    age: int = Field(..., ge=13, le=100, description="Age of the persona")
    location: str = Field(..., description="Geographic location")
    gender: str = Field(..., description="Gender identity")

    # Demographics
    occupation: str = Field(..., description="Job or occupation")
    income_level: str = Field(..., description="Income bracket")
    education: str = Field(..., description="Education level")

    # Interests and behaviors
    interests: List[str] = Field(default_factory=list, description="List of interests/hobbies")
    content_preferences: List[str] = Field(
        default_factory=list, description="Types of content they prefer"
    )
    platform_usage_hours: float = Field(
        ..., ge=0, description="Average daily hours on platform"
    )

    # Personality traits
    personality_traits: List[str] = Field(
        default_factory=list,
        description="Personality characteristics (e.g., extroverted, skeptical)",
    )

    # Behavioral patterns
    engagement_likelihood: float = Field(
        ..., ge=0.0, le=1.0, description="General likelihood to engage with content"
    )
    sharing_tendency: float = Field(
        ..., ge=0.0, le=1.0, description="Propensity to share content"
    )
    influenceability: float = Field(
        ..., ge=0.0, le=1.0, description="How easily influenced by others"
    )
    content_creator: bool = Field(
        default=False, description="Whether they create content themselves"
    )

    # Platform-specific
    platform: str = Field(..., description="Primary platform (instagram, tiktok, twitter, youtube)")
    follower_count: Optional[int] = Field(None, description="Number of followers (if relevant)")
    following_count: Optional[int] = Field(None, description="Number of accounts they follow")

    class Config:
        json_schema_extra = {
            "example": {
                "persona_id": "persona_001",
                "name": "Sarah Martinez",
                "age": 28,
                "location": "Los Angeles, CA",
                "gender": "Female",
                "occupation": "Fashion Designer",
                "income_level": "Upper Middle Class",
                "education": "Bachelor's Degree",
                "interests": ["fashion", "photography", "travel", "wellness"],
                "content_preferences": ["fashion tips", "behind-the-scenes", "lifestyle"],
                "platform_usage_hours": 2.5,
                "personality_traits": ["creative", "trend-conscious", "social"],
                "engagement_likelihood": 0.7,
                "sharing_tendency": 0.6,
                "influenceability": 0.5,
                "content_creator": True,
                "platform": "instagram",
                "follower_count": 5400,
                "following_count": 820,
            }
        }
