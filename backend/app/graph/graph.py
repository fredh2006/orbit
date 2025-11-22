"""LangGraph pipeline definition connecting all nodes."""

from langgraph.graph import StateGraph, END

from app.graph.state import VideoTestState
from app.graph.nodes.video_analysis.node import video_analysis_node
from app.graph.nodes.initial_reaction.node import initial_reaction_node
from app.graph.nodes.network_generation.node import network_generation_node
from app.graph.nodes.interaction.node import interaction_node
from app.graph.nodes.second_reaction.node import second_reaction_node
from app.graph.nodes.results_compilation.node import results_compilation_node
from app.graph.nodes.platform_prediction.node import platform_prediction_node


def create_video_test_graph():
    """Create the 7-node LangGraph pipeline for video testing.

    Graph Flow:
        START
          ↓
        Video Analysis (Node 1)
          ↓
        Initial Reactions (Node 2) - Parallel
          ↓
        Network Generation (Node 2.5)
          ↓
        Persona Interactions (Node 3)
          ↓
        Second Reactions (Node 4) - Parallel
          ↓
        Results Compilation (Node 5)
          ↓
        Platform Prediction (Node 6)
          ↓
        END

    Returns:
        Compiled LangGraph StateGraph
    """
    # Create the graph
    workflow = StateGraph(VideoTestState)

    # Add all nodes
    workflow.add_node("video_analysis", video_analysis_node.execute)
    workflow.add_node("initial_reactions", initial_reaction_node.execute)
    workflow.add_node("network_generation", network_generation_node.execute)
    workflow.add_node("interactions", interaction_node.execute)
    workflow.add_node("second_reactions", second_reaction_node.execute)
    workflow.add_node("results_compilation", results_compilation_node.execute)
    workflow.add_node("platform_prediction", platform_prediction_node.execute)

    # Define edges (sequential flow)
    workflow.set_entry_point("video_analysis")
    workflow.add_edge("video_analysis", "initial_reactions")
    workflow.add_edge("initial_reactions", "network_generation")
    workflow.add_edge("network_generation", "interactions")
    workflow.add_edge("interactions", "second_reactions")
    workflow.add_edge("second_reactions", "results_compilation")
    workflow.add_edge("results_compilation", "platform_prediction")
    workflow.add_edge("platform_prediction", END)

    # Compile the graph
    return workflow.compile()


# Create global graph instance
video_test_graph = create_video_test_graph()
