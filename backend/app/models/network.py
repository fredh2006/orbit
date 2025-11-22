"""Network data models for dynamic social network generation."""

from pydantic import BaseModel, Field
from typing import List


class NetworkEdge(BaseModel):
    """Represents a connection between two personas."""

    source: str = Field(..., description="Source persona ID")
    target: str = Field(..., description="Target persona ID")
    connection_strength: float = Field(
        ..., ge=0.0, le=1.0, description="Strength of connection (0.0-1.0)"
    )
    connection_type: str = Field(
        ...,
        description="Type of connection (close_friend, acquaintance, follower, following)",
    )
    shared_traits: List[str] = Field(
        default_factory=list,
        description="Shared characteristics that created this connection",
    )


class NetworkCluster(BaseModel):
    """Represents a cluster or community within the network."""

    cluster_id: str = Field(..., description="Unique identifier for the cluster")
    members: List[str] = Field(
        ..., description="List of persona IDs in this cluster"
    )
    cluster_traits: List[str] = Field(
        ..., description="Defining traits of this cluster"
    )


class PersonaNetwork(BaseModel):
    """Complete social network graph for the simulation."""

    nodes: List[str] = Field(..., description="List of all persona IDs in the network")
    edges: List[NetworkEdge] = Field(..., description="All connections between personas")
    clusters: List[NetworkCluster] = Field(
        default_factory=list, description="Identified communities/clusters"
    )

    # Network statistics
    connection_density: float = Field(
        ..., description="Average number of connections per persona"
    )
    clustering_coefficient: float = Field(
        ..., ge=0.0, le=1.0, description="Measure of network clustering"
    )
    avg_path_length: float = Field(
        ..., description="Average shortest path between any two personas"
    )

    # Influence analysis
    influence_hubs: List[str] = Field(
        default_factory=list,
        description="Persona IDs with high connection counts (potential influencers)",
    )
    hub_threshold: int = Field(
        ..., description="Min connections needed to be considered a hub"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "nodes": ["persona_001", "persona_002", "persona_003"],
                "edges": [
                    {
                        "source": "persona_001",
                        "target": "persona_002",
                        "connection_strength": 0.8,
                        "connection_type": "close_friend",
                        "shared_traits": ["fashion", "age_group_25-34", "los_angeles"],
                    }
                ],
                "clusters": [
                    {
                        "cluster_id": "fashion_la",
                        "members": ["persona_001", "persona_002"],
                        "cluster_traits": ["fashion", "los_angeles"],
                    }
                ],
                "connection_density": 12.5,
                "clustering_coefficient": 0.42,
                "avg_path_length": 3.2,
                "influence_hubs": ["persona_001", "persona_045"],
                "hub_threshold": 25,
            }
        }
