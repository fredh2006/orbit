"""Results Compilation Node - Aggregates all data into final outputs."""

from typing import Dict, Any, List
from collections import defaultdict
from pathlib import Path
from datetime import datetime

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

    def export_to_markdown(self, state: VideoTestState, output_dir: str = "analysis_exports") -> str:
        """Export analysis results to a markdown file.

        Args:
            state: Current pipeline state with all results
            output_dir: Directory to save markdown files

        Returns:
            Path to the generated markdown file
        """
        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        # Generate filename
        test_id = state.get('test_id', 'unknown')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"analysis_{test_id[:8]}_{timestamp}.md"
        filepath = output_path / filename

        # Build markdown content
        md_lines = []

        # Header
        md_lines.append("# Video Analysis Results\n")
        md_lines.append(f"**Test ID:** {state.get('test_id', 'N/A')}\n")
        md_lines.append(f"**Platform:** {state.get('platform', 'N/A').title()}\n")
        md_lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        md_lines.append("\n---\n\n")

        # Video Analysis Summary
        video_analysis = state.get('video_analysis')
        if video_analysis:
            md_lines.append("## Video Analysis\n\n")
            md_lines.append(f"**Summary:** {video_analysis.get('summary', 'N/A')}\n\n")

            if video_analysis.get('key_themes'):
                md_lines.append("**Key Themes:**\n")
                for theme in video_analysis['key_themes']:
                    md_lines.append(f"- {theme}\n")
                md_lines.append("\n")

            if video_analysis.get('visual_elements'):
                md_lines.append("**Visual Elements:**\n")
                for element in video_analysis['visual_elements']:
                    md_lines.append(f"- {element}\n")
                md_lines.append("\n")

            if video_analysis.get('target_audience'):
                md_lines.append(f"**Target Audience:** {video_analysis['target_audience']}\n\n")

            if video_analysis.get('tone'):
                md_lines.append(f"**Tone:** {video_analysis['tone']}\n\n")

            md_lines.append("---\n\n")

        # Overall Metrics
        final_metrics = state.get('final_metrics')
        if final_metrics:
            md_lines.append("## Overall Performance Metrics\n\n")
            md_lines.append(f"- **Total Views:** {final_metrics.get('total_views', 0):,}\n")
            md_lines.append(f"- **Total Likes:** {final_metrics.get('total_likes', 0):,}\n")
            md_lines.append(f"- **Total Comments:** {final_metrics.get('total_comments', 0):,}\n")
            md_lines.append(f"- **Total Shares:** {final_metrics.get('total_shares', 0):,}\n")
            md_lines.append(f"- **Engagement Rate:** {final_metrics.get('engagement_rate', 0):.2%}\n")
            md_lines.append(f"- **Viral Coefficient:** {final_metrics.get('viral_coefficient', 0):.2f}\n\n")
            md_lines.append("---\n\n")

        # Get personas and reactions
        personas = state.get('personas', [])
        personas_map = {p['persona_id']: p for p in personas if isinstance(p, dict) and 'persona_id' in p}

        # Use second_reactions if available, otherwise initial_reactions
        reactions = state.get('second_reactions') or state.get('initial_reactions', [])

        # Separate reactions by engagement type
        shared = []
        engaged = []
        not_engaged = []

        for reaction in reactions:
            if not isinstance(reaction, dict) or 'persona_id' not in reaction:
                continue

            persona_id = reaction['persona_id']
            persona = personas_map.get(persona_id, {})

            reaction_data = {'persona': persona, 'reaction': reaction}

            if reaction.get('shared') or reaction.get('will_share'):
                shared.append(reaction_data)
            elif reaction.get('engaged') or reaction.get('will_like') or reaction.get('will_comment'):
                engaged.append(reaction_data)
            else:
                not_engaged.append(reaction_data)

        # Personas Who Shared
        md_lines.append(f"## Personas Who Shared ({len(shared)})\n\n")
        for item in shared:
            persona = item['persona']
            reaction = item['reaction']

            md_lines.append(f"### {persona.get('name', 'Unknown')}\n\n")
            md_lines.append(f"- **Age:** {persona.get('age', 'N/A')}\n")
            md_lines.append(f"- **Location:** {persona.get('location', 'N/A')}\n")
            md_lines.append(f"- **Occupation:** {persona.get('occupation', 'N/A')}\n")
            md_lines.append(f"- **Interests:** {', '.join(persona.get('interests', []))}\n")

            if reaction.get('reason'):
                md_lines.append(f"\n**Why they shared:**\n> {reaction['reason']}\n\n")

            if reaction.get('changed_from_initial'):
                md_lines.append(f"*Note: Changed behavior after social influence (Influence level: {reaction.get('influence_level', 'N/A')})*\n\n")

            md_lines.append("---\n\n")

        # Personas Who Engaged
        md_lines.append(f"## Personas Who Engaged (Liked/Commented) ({len(engaged)})\n\n")
        for item in engaged:
            persona = item['persona']
            reaction = item['reaction']

            md_lines.append(f"### {persona.get('name', 'Unknown')}\n\n")
            md_lines.append(f"- **Age:** {persona.get('age', 'N/A')}\n")
            md_lines.append(f"- **Location:** {persona.get('location', 'N/A')}\n")
            md_lines.append(f"- **Occupation:** {persona.get('occupation', 'N/A')}\n")
            md_lines.append(f"- **Interests:** {', '.join(persona.get('interests', []))}\n")

            actions = []
            if reaction.get('will_like') or reaction.get('liked'):
                actions.append("Liked")
            if reaction.get('will_comment') or reaction.get('commented'):
                actions.append("Commented")

            if actions:
                md_lines.append(f"- **Actions:** {', '.join(actions)}\n")

            if reaction.get('reason'):
                md_lines.append(f"\n**Why they engaged:**\n> {reaction['reason']}\n\n")

            if reaction.get('changed_from_initial'):
                md_lines.append(f"*Note: Changed behavior after social influence (Influence level: {reaction.get('influence_level', 'N/A')})*\n\n")

            md_lines.append("---\n\n")

        # Interaction Events
        interaction_events = state.get('interaction_events', [])
        if interaction_events:
            md_lines.append(f"## Interaction Events ({len(interaction_events)})\n\n")
            md_lines.append("These are the conversations and sharing events that occurred during the viral spread:\n\n")

            for event in interaction_events[:50]:  # Limit to first 50 interactions
                source = personas_map.get(event.get('source_persona_id'), {})
                target = personas_map.get(event.get('target_persona_id'), {})

                md_lines.append(f"### {source.get('name', 'Unknown')} → {target.get('name', 'Unknown')}\n\n")
                md_lines.append(f"**Type:** {event.get('interaction_type', 'N/A')}\n")
                md_lines.append(f"**Influence Strength:** {event.get('influence_strength', 0):.2f}\n\n")

                if event.get('content'):
                    md_lines.append(f"**What they said:**\n> {event['content']}\n\n")

                if event.get('target_response'):
                    md_lines.append(f"**Response:**\n> {event['target_response']}\n\n")

                md_lines.append("---\n\n")

        # Personas Who Didn't Engage (limited)
        md_lines.append(f"## Personas Who Didn't Engage ({len(not_engaged)})\n\n")
        md_lines.append("*Showing first 20 personas who didn't engage*\n\n")

        for item in not_engaged[:20]:
            persona = item['persona']
            reaction = item['reaction']

            md_lines.append(f"### {persona.get('name', 'Unknown')}\n\n")
            md_lines.append(f"- **Age:** {persona.get('age', 'N/A')}\n")
            md_lines.append(f"- **Occupation:** {persona.get('occupation', 'N/A')}\n")
            md_lines.append(f"- **Interests:** {', '.join(persona.get('interests', []))}\n")

            if reaction.get('reason'):
                md_lines.append(f"\n**Why they didn't engage:**\n> {reaction['reason']}\n\n")

            md_lines.append("---\n\n")

        # Write to file
        filepath.write_text('\n'.join(md_lines))

        print(f"[Node 5] ✓ Exported analysis to: {filepath.absolute()}")
        print(f"[Node 5]   - Shared: {len(shared)}, Engaged: {len(engaged)}, Not engaged: {len(not_engaged)}")
        print(f"[Node 5]   - Interactions: {len(interaction_events)}")

        return str(filepath.absolute())

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

            # Export results to markdown
            updated_state = {
                **state,
                "final_metrics": final_metrics,
                "node_graph_data": node_graph_data,
                "engagement_timeline": engagement_timeline,
                "reaction_insights": reaction_insights,
                "status": "complete",
            }

            try:
                markdown_path = self.export_to_markdown(updated_state)
                print(f"[Node 5] ✓ Analysis exported to markdown: {markdown_path}")
            except Exception as e:
                print(f"[Node 5] Warning: Failed to export markdown: {e}")

            return updated_state

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
