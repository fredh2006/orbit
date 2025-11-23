"""Interaction Node - Simulates persona-to-persona interactions using Gemini."""

import json
import re
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

    def _clean_json_response(self, response_text: str) -> dict:
        """Clean and parse JSON response from Gemini API.

        Args:
            response_text: Raw response text from API

        Returns:
            Parsed JSON as dict

        Raises:
            ValueError: If response cannot be parsed as valid JSON dict
        """
        # Log response length for debugging
        print(f"[Node 3] Response length: {len(response_text)} characters")

        # Remove markdown code blocks if present
        cleaned = re.sub(r'^```json\s*', '', response_text.strip())
        cleaned = re.sub(r'\s*```$', '', cleaned)

        # Check if response looks truncated (doesn't end with } or ])
        if cleaned and cleaned[-1] not in ['}', ']']:
            print(f"[Node 3] Warning: Response appears truncated (ends with '{cleaned[-50:]}')")
            raise ValueError("Response appears to be truncated")

        # Try to parse JSON
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as e:
            # Log the error details
            print(f"[Node 3] JSON parsing error at position {e.pos}: {e.msg}")
            print(f"[Node 3] Context around error: ...{cleaned[max(0, e.pos-100):e.pos+100]}...")
            raise

        # Ensure it's a dict
        if not isinstance(parsed, dict):
            raise ValueError(f"Expected JSON object, got {type(parsed).__name__}: {str(parsed)[:100]}")

        return parsed

    def create_fallback_interactions(self) -> dict:
        """Create minimal fallback interaction results.

        Returns:
            Minimal interaction results dict
        """
        return {
            "events": [],
            "total_interactions": 0,
            "unique_sharers": 0,
            "max_chain_length": 0,
            "is_fallback": True
        }

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

            # Check if network exists, use fallback if not
            if not persona_network:
                print(f"[Node 3] Warning: Persona network not found, using fallback (no interactions)")
                interaction_results = self.create_fallback_interactions()
                return {
                    **state,
                    "interaction_results": interaction_results,
                    "interaction_events": [],
                    "status": "interactions_complete",
                }

            # Create simplified network data (just IDs and connections)
            simplified_network = {
                "edges": persona_network.get("edges", []),
                "influence_hubs": [
                    {"persona_id": h["persona_id"], "influence_score": h.get("influence_score", 0.5)}
                    for h in persona_network.get("influence_hubs", [])
                ]
            }

            # Create simplified reactions (just engagement status)
            simplified_reactions = [
                {
                    "persona_id": r["persona_id"],
                    "will_share": r.get("will_share", False),
                    "engagement_level": r.get("engagement_level", "none")
                }
                for r in initial_reactions
            ]

            # Format prompt with simplified data
            prompt = self.prompt_template.format(
                platform=platform,
                network_data=json.dumps(simplified_network, indent=2),
                reactions_data=json.dumps(simplified_reactions, indent=2),
            )

            print(f"[Node 3] Simulating interactions on {platform}...")
            print(f"[Node 3] Prompt size: {len(prompt)} characters")
            print(f"[Node 3] Network edges: {len(simplified_network.get('edges', []))}, Engaged personas: {sum(1 for r in simplified_reactions if r['will_share'])}")

            # Generate interactions using Gemini 2.0 Flash (not flash-lite, for better reliability)
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.7,  # Moderate temp for realistic variety
                model="gemini-2.0-flash-exp",
                max_output_tokens=16384,  # Increased token limit for complex interactions
            )

            # Parse JSON response with cleaning
            try:
                interaction_results = self._clean_json_response(response_text)
            except Exception as parse_error:
                print(f"[Node 3] Warning: JSON parsing failed ({parse_error}), using fallback")
                interaction_results = self.create_fallback_interactions()

            # Extract events for easier access
            interaction_events = interaction_results.get("events", [])

            total_interactions = interaction_results.get("total_interactions", 0)
            unique_sharers = interaction_results.get("unique_sharers", 0)
            max_chain = interaction_results.get("max_chain_length", 0)

            is_fallback = interaction_results.get("is_fallback", False)
            fallback_msg = " (no interactions)" if is_fallback else ""

            print(
                f"[Node 3] ✓ Interactions simulated{fallback_msg}: {total_interactions} interactions, "
                f"{unique_sharers} sharers, max chain length: {max_chain}"
            )

            return {
                **state,
                "interaction_results": interaction_results,
                "interaction_events": interaction_events,
                "status": "interactions_complete",
            }

        except Exception as e:
            # Even on complete failure, provide fallback
            error_msg = f"Interaction simulation failed: {str(e)}"
            print(f"[Node 3] ⚠ {error_msg}, using fallback")

            fallback_results = self.create_fallback_interactions()

            return {
                **state,
                "interaction_results": fallback_results,
                "interaction_events": [],
                "errors": state.get("errors", []) + [error_msg],
                "status": "interactions_complete",  # Mark as complete even with fallback
            }


# Node instance
interaction_node = InteractionNode()
