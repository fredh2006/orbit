"""Initial Reaction Node - Generates parallel initial reactions from personas."""

import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client
from app.services.persona_loader import persona_loader
from app.models.persona import Persona
from app.models.reaction import InitialReaction
from app.config import settings


class InitialReactionNode:
    """Node 2: Generates initial reactions from all personas in parallel."""

    def __init__(self):
        """Initialize the initial reaction node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    async def generate_single_reaction(
        self, persona: Persona, video_analysis: dict
    ) -> dict:
        """Generate reaction for a single persona.

        Args:
            persona: The persona to generate reaction for
            video_analysis: Video analysis data

        Returns:
            Reaction data as dict
        """
        try:
            # Format the prompt with persona and video data
            prompt = self.prompt_template.format(
                persona_id=persona.persona_id,
                persona_data=json.dumps(persona.model_dump(), indent=2),
                video_analysis=json.dumps(video_analysis, indent=2),
            )

            # Generate reaction using fast model
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.8,  # Higher temp for variety
                model=settings.GEMINI_FAST_MODEL,
            )

            # Parse and validate
            reaction_data = json.loads(response_text)
            return reaction_data

        except Exception as e:
            # Return a default "no engagement" reaction on error
            print(
                f"[Node 2] Warning: Failed to generate reaction for {persona.persona_id}: {e}"
            )
            return {
                "persona_id": persona.persona_id,
                "will_view": False,
                "will_like": False,
                "will_share": False,
                "will_comment": False,
                "engagement_probability": 0.0,
                "reaction_time": 0.0,
                "reasoning": "Error generating reaction",
                "sentiment": "neutral",
                "comment_text": None,
            }

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute initial reaction generation for all personas.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with personas and initial_reactions populated
        """
        try:
            print(f"[Node 2] Generating initial reactions...")

            # Load personas for the platform
            platform = state["platform"]
            personas = persona_loader.load_personas(platform)

            print(f"[Node 2] Loaded {len(personas)} personas for {platform}")

            # Convert personas to dicts for state storage
            personas_data = [p.model_dump() for p in personas]

            # Get video analysis from previous node
            video_analysis = state.get("video_analysis")
            if not video_analysis:
                raise ValueError("Video analysis not found in state")

            # Generate reactions in parallel for all personas
            print(
                f"[Node 2] Generating {len(personas)} reactions in parallel (max {gemini_client.max_concurrent} concurrent)..."
            )

            tasks = [
                self.generate_single_reaction(persona, video_analysis)
                for persona in personas
            ]

            reactions_data = await asyncio.gather(*tasks)

            # Count engagement
            engaged_count = sum(
                1 for r in reactions_data if r.get("engagement_probability", 0) > 0.5
            )

            print(
                f"[Node 2] ✓ Initial reactions complete. {engaged_count}/{len(personas)} personas engaged"
            )

            return {
                **state,
                "personas": personas_data,
                "initial_reactions": reactions_data,
                "status": "initial_reactions_complete",
            }

        except Exception as e:
            error_msg = f"Initial reaction generation failed: {str(e)}"
            print(f"[Node 2] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "initial_reactions_failed",
            }


# Node instance
initial_reaction_node = InitialReactionNode()
