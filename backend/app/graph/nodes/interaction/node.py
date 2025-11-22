"""Interaction Node - Simulates persona-to-persona interactions using Gemini."""

import json
from pathlib import Path
from typing import Dict, Any

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client
from app.config import settings


class InteractionNode:
    """Node 3: Simulates social interactions and influence spread through network."""

    def __init__(self):
        """Initialize the interaction node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute interaction simulation.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with interaction_results and interaction_events populated
        """
        try:
            print(f"[Node 3] Simulating persona interactions...")

            # Get data from state
            persona_network = state.get("persona_network")
            initial_reactions = state.get("initial_reactions", [])
            platform = state["platform"]

            if not persona_network:
                raise ValueError("Persona network not found in state")

            # Format prompt
            prompt = self.prompt_template.format(
                platform=platform,
                network_data=json.dumps(persona_network, indent=2),
                reactions_data=json.dumps(initial_reactions, indent=2),
            )

            print(f"[Node 3] Simulating interactions on {platform}...")

            # Generate interactions using Gemini fast model
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.7,  # Moderate temp for realistic variety
                model=settings.GEMINI_FAST_MODEL,
            )

            # Parse JSON response
            interaction_results = json.loads(response_text)

            # Extract events for easier access
            interaction_events = interaction_results.get("events", [])

            total_interactions = interaction_results.get("total_interactions", 0)
            unique_sharers = interaction_results.get("unique_sharers", 0)
            max_chain = interaction_results.get("max_chain_length", 0)

            print(
                f"[Node 3] ✓ Interactions simulated: {total_interactions} interactions, "
                f"{unique_sharers} sharers, max chain length: {max_chain}"
            )

            return {
                **state,
                "interaction_results": interaction_results,
                "interaction_events": interaction_events,
                "status": "interactions_complete",
            }

        except Exception as e:
            error_msg = f"Interaction simulation failed: {str(e)}"
            print(f"[Node 3] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "interactions_failed",
            }


# Node instance
interaction_node = InteractionNode()
