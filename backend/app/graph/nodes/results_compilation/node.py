"""Results Compilation Node - Aggregates all data into final outputs."""

from typing import Dict, Any, List
from collections import defaultdict

from app.graph.state import VideoTestState


class ResultsCompilationNode:
    """Node 5: Compiles all results into final metrics, graph data, timeline, and insights."""

    def compile_final_metrics(
        self,
        initial_reactions: List[dict],
        second_reactions: List[dict],
        interaction_results: dict,
    ) -> dict:
        """Compile final engagement metrics.

        Args:
            initial_reactions: Initial reaction data
            second_reactions: Second-round reaction data
            interaction_results: Interaction simulation results

        Returns:
            Final metrics dict
        """
        total_personas = len(second_reactions)

        # Count second-round engagement
        total_views = sum(1 for r in second_reactions if r.get("will_view", False))
        total_likes = sum(1 for r in second_reactions if r.get("will_like", False))
        total_shares = sum(1 for r in second_reactions if r.get("will_share", False))
        total_comments = sum(
            1 for r in second_reactions if r.get("will_comment", False)
        )

        # Calculate rates
        view_rate = total_views / total_personas if total_personas > 0 else 0
        engaged = sum(
            1
            for r in second_reactions
            if r.get("will_like") or r.get("will_share") or r.get("will_comment")
        )
        engagement_rate = engaged / total_personas if total_personas > 0 else 0

        # Viral coefficient (shares per sharer)
        viral_coefficient = (
            total_shares / max(1, sum(1 for r in second_reactions if r.get("will_share")))
        )

        # Reaction shift analysis
        personas_who_changed = sum(
            1 for r in second_reactions if r.get("changed_from_initial", False)
        )
        change_rate = (
            personas_who_changed / total_personas if total_personas > 0 else 0
        )

        # Social influence impact
        social_influence_engagement = sum(
            1
            for r in second_reactions
            if r.get("changed_from_initial", False)
            and (r.get("will_like") or r.get("will_share"))
        )
        social_influence_percentage = (
            social_influence_engagement / max(1, engaged) if engaged > 0 else 0
        )

        # Time metrics (simplified - using interaction results)
        peak_engagement_time = 450.0  # Placeholder
        time_to_viral = None  # Would calculate if viral threshold reached

        return {
            "total_views": total_views,
            "total_likes": total_likes,
            "total_shares": total_shares,
            "total_comments": total_comments,
            "view_rate": round(view_rate, 3),
            "engagement_rate": round(engagement_rate, 3),
            "viral_coefficient": round(viral_coefficient, 2),
            "personas_who_changed": personas_who_changed,
            "change_rate": round(change_rate, 3),
            "social_influence_engagement": social_influence_engagement,
            "social_influence_percentage": round(social_influence_percentage, 3),
            "peak_engagement_time": peak_engagement_time,
            "time_to_viral": time_to_viral,
        }

    def compile_node_graph_data(
        self, personas: List[dict], second_reactions: List[dict], persona_network: dict
    ) -> dict:
        """Compile node graph visualization data.

        Args:
            personas: Persona data
            second_reactions: Second-round reactions
            persona_network: Network graph

        Returns:
            Node graph data for frontend
        """
        # Create reaction lookup (filter out invalid reactions)
        valid_reactions = [r for r in second_reactions if isinstance(r, dict) and "persona_id" in r]
        reaction_lookup = {r["persona_id"]: r for r in valid_reactions}

        # Build nodes with positions and states
        nodes = []
        for i, persona in enumerate(personas):
            reaction = reaction_lookup.get(persona["persona_id"], {})
            engaged = (
                reaction.get("will_like")
                or reaction.get("will_share")
                or reaction.get("will_comment")
            )
            influenced = reaction.get("changed_from_initial", False)

            nodes.append(
                {
                    "id": persona["persona_id"],
                    "name": persona["name"],
                    "x": i * 10,  # Simple layout (frontend will re-layout)
                    "y": i * 10,
                    "engaged": engaged,
                    "influenced": influenced,
                    "sentiment": reaction.get("updated_sentiment", "neutral"),
                }
            )

        # Get edges from network
        edges = persona_network.get("edges", [])

        # Get clusters
        clusters = persona_network.get("clusters", [])

        # Get influence hubs
        influence_hubs = persona_network.get("influence_hubs", [])

        return {
            "nodes": nodes,
            "edges": edges,
            "clusters": clusters,
            "influence_hubs": influence_hubs,
        }

    def compile_engagement_timeline(
        self, initial_reactions: List[dict], interaction_events: List[dict],
        second_reactions: List[dict]
    ) -> List[dict]:
        """Compile chronological timeline of events.

        Args:
            initial_reactions: Initial reactions
            interaction_events: Interaction events (can be None)
            second_reactions: Second-round reactions

        Returns:
            List of timeline events
        """
        timeline = []

        # Add initial reaction events
        for reaction in initial_reactions:
            if reaction.get("will_view"):
                timeline.append(
                    {
                        "timestamp": reaction.get("reaction_time", 0.0),
                        "event_type": "view",
                        "persona_id": reaction["persona_id"],
                        "details": {
                            "will_like": reaction.get("will_like"),
                            "will_share": reaction.get("will_share"),
                        },
                    }
                )

        # Add interaction events (handle None)
        if interaction_events:
            for event in interaction_events:
                timeline.append(
                    {
                        "timestamp": event.get("timestamp", 0.0),
                        "event_type": event.get("interaction_type", "interaction"),
                        "persona_id": event.get("source_persona_id"),
                        "details": {
                            "target": event.get("target_persona_id"),
                            "content": event.get("content"),
                        },
                    }
                )

        # Sort by timestamp
        timeline.sort(key=lambda x: x["timestamp"])

        return timeline

    def compile_reaction_insights(
        self, personas: List[dict], initial_reactions: List[dict],
        second_reactions: List[dict]
    ) -> dict:
        """Extract insights from reaction changes.

        Args:
            personas: Persona data
            initial_reactions: Initial reactions
            second_reactions: Second-round reactions

        Returns:
            Insights dict
        """
        # Create lookups (filter out invalid entries)
        valid_personas = [p for p in personas if isinstance(p, dict) and "persona_id" in p]
        valid_initial = [r for r in initial_reactions if isinstance(r, dict) and "persona_id" in r]
        persona_lookup = {p["persona_id"]: p for p in valid_personas}
        initial_lookup = {r["persona_id"]: r for r in valid_initial}

        # Find most influenced
        influenced_personas = [
            r for r in second_reactions if r.get("influence_level", 0) > 0.6
        ]
        most_influenced = [r["persona_id"] for r in influenced_personas[:10]]

        # Find most resistant
        resistant_personas = [
            r
            for r in second_reactions
            if r.get("influence_level", 0) < 0.2 and not r.get("changed_from_initial")
        ]
        most_resistant = [r["persona_id"] for r in resistant_personas[:10]]

        # Demographics analysis (simplified)
        influenced_demographics = {"age_groups": {}, "interests": {}}

        # Sentiment shifts
        sentiment_shifts = {"positive_to_negative": 0, "negative_to_positive": 0,
                           "neutral_to_positive": 0, "neutral_to_negative": 0}

        for second_r in second_reactions:
            if second_r.get("changed_from_initial"):
                persona_id = second_r["persona_id"]
                initial_r = initial_lookup.get(persona_id, {})
                initial_sent = initial_r.get("sentiment", "neutral")
                final_sent = second_r.get("updated_sentiment", "neutral")

                shift_key = f"{initial_sent}_to_{final_sent}"
                if shift_key in sentiment_shifts:
                    sentiment_shifts[shift_key] += 1

        # Calculate average sentiment change
        avg_sentiment_change = 0.0  # Simplified

        # Content strengths/weaknesses (placeholder)
        content_strengths = ["Strong visual appeal", "High shareability"]
        content_weaknesses = ["Could improve hook strength"]

        return {
            "most_influenced_personas": most_influenced,
            "most_resistant_personas": most_resistant,
            "influenced_demographics": influenced_demographics,
            "platform_specific_patterns": {},
            "sentiment_shifts": sentiment_shifts,
            "avg_sentiment_change": avg_sentiment_change,
            "content_strengths": content_strengths,
            "content_weaknesses": content_weaknesses,
        }

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute results compilation.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with all final results populated
        """
        try:
            print(f"[Node 5] Compiling final results...")

            # Get all data from state
            personas = state.get("personas", [])
            initial_reactions = state.get("initial_reactions", [])
            second_reactions = state.get("second_reactions")
            persona_network = state.get("persona_network", {})
            interaction_results = state.get("interaction_results", {})
            interaction_events = state.get("interaction_events", [])

            # If second_reactions is None or invalid, use initial_reactions as fallback
            if not second_reactions or not isinstance(second_reactions, list):
                print("[Node 5] Warning: second_reactions is None or invalid, using initial_reactions")
                second_reactions = initial_reactions

            # Compile all components
            print("[Node 5] Compiling metrics...")
            final_metrics = self.compile_final_metrics(
                initial_reactions, second_reactions, interaction_results
            )

            print("[Node 5] Compiling graph data...")
            node_graph_data = self.compile_node_graph_data(
                personas, second_reactions, persona_network
            )

            print("[Node 5] Compiling timeline...")
            engagement_timeline = self.compile_engagement_timeline(
                initial_reactions, interaction_events, second_reactions
            )

            print("[Node 5] Extracting insights...")
            reaction_insights = self.compile_reaction_insights(
                personas, initial_reactions, second_reactions
            )

            print(
                f"[Node 5] ✓ Results compiled: {final_metrics['total_views']} views, "
                f"{final_metrics['engagement_rate']*100:.1f}% engagement rate"
            )

            return {
                **state,
                "final_metrics": final_metrics,
                "node_graph_data": node_graph_data,
                "engagement_timeline": engagement_timeline,
                "reaction_insights": reaction_insights,
                "status": "complete",
            }

        except Exception as e:
            error_msg = f"Results compilation failed: {str(e)}"
            print(f"[Node 5] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "compilation_failed",
            }


# Node instance
results_compilation_node = ResultsCompilationNode()
