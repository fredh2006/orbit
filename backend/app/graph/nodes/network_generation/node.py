"""Network Generation Node - Creates dynamic social network using Gemini."""

import json
from pathlib import Path
from typing import Dict, Any

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client


class NetworkGenerationNode:
    """Node 2.5: Generates dynamic social network connections between personas."""

    def __init__(self):
        """Initialize the network generation node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    def create_personas_summary(self, personas: list[dict]) -> str:
        """Create a compact summary of personas for the prompt.

        Args:
            personas: List of persona data

        Returns:
            Formatted summary string
        """
        summary_lines = []
        for p in personas:
            summary_lines.append(
                f"- {p['persona_id']}: {p['name']}, {p['age']}, {p['location']}, "
                f"interests: {', '.join(p.get('interests', [])[:3])}, "
                f"traits: {', '.join(p.get('personality_traits', [])[:2])}"
            )

        return "\n".join(summary_lines)

    def create_reactions_summary(self, reactions: list[dict]) -> str:
        """Create a summary of initial reactions.

        Args:
            reactions: List of reaction data

        Returns:
            Formatted summary string
        """
        engaged = [r for r in reactions if r.get("engagement_probability", 0) > 0.5]
        summary = f"Total personas: {len(reactions)}\n"
        summary += f"Engaged: {len(engaged)}\n"
        summary += f"Engagement rate: {len(engaged)/len(reactions)*100:.1f}%\n"

        return summary

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute network generation.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with persona_network populated
        """
        try:
            print(f"[Node 2.5] Generating dynamic social network...")

            # Get personas and reactions from state
            personas = state.get("personas", [])
            initial_reactions = state.get("initial_reactions", [])
            platform = state["platform"]

            if not personas:
                raise ValueError("Personas not found in state")

            # Create summaries for prompt
            personas_summary = self.create_personas_summary(personas)
            reactions_summary = self.create_reactions_summary(initial_reactions)

            # Format prompt
            prompt = self.prompt_template.format(
                platform=platform,
                personas_summary=personas_summary,
                reactions_summary=reactions_summary,
            )

            print(
                f"[Node 2.5] Requesting network for {len(personas)} personas on {platform}..."
            )

            # Generate network using Gemini
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.7,  # Moderate creativity for realistic variance
            )

            # Parse JSON response
            persona_network = json.loads(response_text)

            # Validate network structure
            edge_count = len(persona_network.get("edges", []))
            cluster_count = len(persona_network.get("clusters", []))
            hub_count = len(persona_network.get("influence_hubs", []))

            print(
                f"[Node 2.5] ✓ Network generated: {edge_count} connections, "
                f"{cluster_count} clusters, {hub_count} influence hubs"
            )

            return {
                **state,
                "persona_network": persona_network,
                "status": "network_generation_complete",
            }

        except Exception as e:
            error_msg = f"Network generation failed: {str(e)}"
            print(f"[Node 2.5] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "network_generation_failed",
            }


# Node instance
network_generation_node = NetworkGenerationNode()
