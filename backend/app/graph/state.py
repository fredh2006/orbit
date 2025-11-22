"""State schema for the LangGraph video testing pipeline."""

from typing import TypedDict, Optional, List


class VideoTestState(TypedDict):
    """State that flows through the 6-node LangGraph pipeline."""

    # Input
    video_id: str
    video_url: str
    platform: str
    simulation_params: dict
    user_context: Optional[dict]  # User information and context
    platform_metrics: Optional[dict]  # Platform-specific metrics for the user

    # Node 1: Video Analysis
    video_analysis: Optional[dict]

    # Node 2: Initial Reactions
    personas: Optional[List[dict]]
    initial_reactions: Optional[List[dict]]

    # Node 2.5: Network Generation
    persona_network: Optional[dict]  # Dynamic network graph

    # Node 3: Interactions
    interaction_results: Optional[dict]
    interaction_events: Optional[List[dict]]

    # Node 4: Second-Round Reactions
    second_reactions: Optional[List[dict]]

    # Node 5: Compiled Results
    final_metrics: Optional[dict]
    node_graph_data: Optional[dict]
    engagement_timeline: Optional[List[dict]]
    reaction_insights: Optional[dict]

    # Node 6: Platform Predictions
    platform_predictions: Optional[dict]

    # Metadata
    errors: List[str]
    status: str
