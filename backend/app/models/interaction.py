"""Interaction data models for persona-to-persona interactions."""

from pydantic import BaseModel, Field
from typing import List, Optional


class InteractionEvent(BaseModel):
    """Represents a single interaction between personas."""

    event_id: str = Field(..., description="Unique identifier for this event")
    timestamp: float = Field(..., description="Time of interaction (seconds from start)")

    # Participants
    source_persona_id: str = Field(..., description="Persona initiating the interaction")
    target_persona_id: str = Field(..., description="Persona receiving the interaction")

    # Interaction details
    interaction_type: str = Field(
        ...,
        description="Type of interaction (share, discuss, comment, influence)",
    )
    content: Optional[str] = Field(
        None, description="Content of the interaction (e.g., message, comment)"
    )

    # Impact
    influence_strength: float = Field(
        ..., ge=0.0, le=1.0, description="How strongly this influenced the target"
    )
    target_response: str = Field(
        ..., description="How the target persona responded"
    )


class InfluenceChain(BaseModel):
    """Represents a chain of influence through the network."""

    chain_id: str = Field(..., description="Unique identifier for this chain")
    persona_sequence: List[str] = Field(
        ..., description="Ordered list of persona IDs showing influence flow"
    )
    total_reach: int = Field(
        ..., description="Total number of personas reached in this chain"
    )
    avg_influence_strength: float = Field(
        ..., ge=0.0, le=1.0, description="Average influence strength across the chain"
    )


class InteractionResults(BaseModel):
    """Complete results from the interaction simulation."""

    # All interaction events
    events: List[InteractionEvent] = Field(
        ..., description="All interactions that occurred"
    )

    # Influence chains
    influence_chains: List[InfluenceChain] = Field(
        default_factory=list, description="Identified chains of influence"
    )

    # Sharing patterns
    sharing_map: dict[str, List[str]] = Field(
        default_factory=dict,
        description="Map of who shared to whom (persona_id -> [target_ids])",
    )

    # Network propagation
    propagation_stages: List[dict] = Field(
        default_factory=list,
        description="Stages of how content spread through network",
    )

    # Summary statistics
    total_interactions: int = Field(..., description="Total number of interactions")
    unique_sharers: int = Field(..., description="Number of unique personas who shared")
    avg_influence_per_interaction: float = Field(
        ..., description="Average influence strength across all interactions"
    )
    max_chain_length: int = Field(
        ..., description="Length of longest influence chain"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "events": [
                    {
                        "event_id": "evt_001",
                        "timestamp": 120.5,
                        "source_persona_id": "persona_001",
                        "target_persona_id": "persona_002",
                        "interaction_type": "share",
                        "content": "Check out this cool video!",
                        "influence_strength": 0.75,
                        "target_response": "watched and liked",
                    }
                ],
                "influence_chains": [
                    {
                        "chain_id": "chain_001",
                        "persona_sequence": ["persona_001", "persona_002", "persona_003"],
                        "total_reach": 3,
                        "avg_influence_strength": 0.68,
                    }
                ],
                "sharing_map": {"persona_001": ["persona_002", "persona_003"]},
                "propagation_stages": [],
                "total_interactions": 245,
                "unique_sharers": 87,
                "avg_influence_per_interaction": 0.62,
                "max_chain_length": 5,
            }
        }
