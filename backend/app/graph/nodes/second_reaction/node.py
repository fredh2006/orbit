"""Second Reaction Node - Generates updated reactions after social influence."""

import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client
from app.config import settings


class SecondReactionNode:
    """Node 4: Generates second-round reactions influenced by social network."""

    def __init__(self):
        """Initialize the second reaction node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    def get_network_interactions_for_persona(
        self, persona_id: str, interaction_events: List[dict], persona_network: dict
    ) -> str:
        """Get relevant network interactions for a specific persona.

        Args:
            persona_id: The persona's ID
            interaction_events: All interaction events
            persona_network: The network graph

        Returns:
            Formatted string of relevant interactions
        """
        # Find interactions where this persona was the target
        relevant_events = [
            event
            for event in interaction_events
            if event.get("target_persona_id") == persona_id
        ]

        if not relevant_events:
            return "No network interactions for this persona."

        # Format the events
        interactions_text = f"Received {len(relevant_events)} interactions:\n"
        for event in relevant_events[:10]:  # Limit to 10 most relevant
            interactions_text += (
                f"- {event.get('source_persona_id')} {event.get('interaction_type')}: "
                f"{event.get('content', 'N/A')} (influence: {event.get('influence_strength', 0):.2f})\n"
            )

        return interactions_text

    async def generate_second_reaction(
        self,
        persona_data: dict,
        initial_reaction: dict,
        interaction_events: List[dict],
        persona_network: dict,
    ) -> dict:
        """Generate updated reaction for a single persona.

        Args:
            persona_data: The persona's profile data
            initial_reaction: Their initial reaction
            interaction_events: All interaction events
            persona_network: The network graph

        Returns:
            Updated reaction data
        """
        try:
            persona_id = persona_data["persona_id"]

            # Get relevant network interactions
            network_interactions = self.get_network_interactions_for_persona(
                persona_id, interaction_events, persona_network
            )

            # Format prompt
            prompt = self.prompt_template.format(
                persona_id=persona_id,
                persona_data=json.dumps(persona_data, indent=2),
                initial_reaction=json.dumps(initial_reaction, indent=2),
                network_interactions_for_persona=network_interactions,
            )

            # Generate updated reaction using Gemini 2.0 Flash-Lite
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.8,
                model="gemini-2.0-flash-lite",
            )

            # Parse and return
            return json.loads(response_text)

        except Exception as e:
            # On error, return unchanged initial reaction
            print(
                f"[Node 4] Warning: Failed to generate second reaction for {persona_id}: {e}"
            )
            return {
                **initial_reaction,
                "influence_level": 0.0,
                "changed_from_initial": False,
                "social_proof_factors": [],
                "reasoning": "Error generating updated reaction",
                "updated_sentiment": initial_reaction.get("sentiment", "neutral"),
                "initial_engagement_probability": initial_reaction.get(
                    "engagement_probability", 0.0
                ),
                "final_engagement_probability": initial_reaction.get(
                    "engagement_probability", 0.0
                ),
            }

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute second-round reaction generation for all personas.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with second_reactions populated
        """
        try:
            print(f"[Node 4] Generating second-round reactions with social influence...")

            # Get data from state
            personas = state.get("personas", [])
            initial_reactions = state.get("initial_reactions", [])
            interaction_events = state.get("interaction_events", [])
            persona_network = state.get("persona_network")

            if not personas or not initial_reactions:
                raise ValueError("Missing personas or initial reactions")

            # Create lookup for initial reactions
            reaction_lookup = {
                r["persona_id"]: r for r in initial_reactions
            }

            print(
                f"[Node 4] Processing {len(personas)} personas with network influence..."
            )

            # Generate second reactions in parallel
            tasks = [
                self.generate_second_reaction(
                    persona, reaction_lookup.get(persona["persona_id"], {}),
                    interaction_events, persona_network
                )
                for persona in personas
            ]

            second_reactions = await asyncio.gather(*tasks)

            # Count changes
            changed_count = sum(
                1 for r in second_reactions if r.get("changed_from_initial", False)
            )
            influenced_count = sum(
                1 for r in second_reactions if r.get("influence_level", 0) > 0.3
            )

            print(
                f"[Node 4] ✓ Second reactions complete. {changed_count} changed reactions, "
                f"{influenced_count} significantly influenced"
            )

            return {
                **state,
                "second_reactions": second_reactions,
                "status": "second_reactions_complete",
            }

        except Exception as e:
            error_msg = f"Second reaction generation failed: {str(e)}"
            print(f"[Node 4] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "second_reactions_failed",
            }


# Node instance
second_reaction_node = SecondReactionNode()
