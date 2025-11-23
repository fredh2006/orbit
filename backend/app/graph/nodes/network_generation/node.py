"""Network Generation Node - Creates dynamic social network using Gemini."""

import json
import re
from pathlib import Path
from typing import Dict, Any

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client
from app.config import settings


class NetworkGenerationNode:
    """Node 2.5: Generates dynamic social network connections between personas."""

    def __init__(self):
        """Initialize the network generation node."""
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
        print(f"[Node 2.5] Response length: {len(response_text)} characters")

        # Remove markdown code blocks if present
        cleaned = re.sub(r'^```json\s*', '', response_text.strip())
        cleaned = re.sub(r'\s*```$', '', cleaned)

        # Check if response looks truncated (doesn't end with } or ])
        if cleaned and cleaned[-1] not in ['}', ']']:
            print(f"[Node 2.5] Warning: Response appears truncated (ends with '{cleaned[-50:]}')")
            raise ValueError("Response appears to be truncated")

        # Try to parse JSON
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as e:
            # Log the error details
            print(f"[Node 2.5] JSON parsing error at position {e.pos}: {e.msg}")
            print(f"[Node 2.5] Context around error: ...{cleaned[max(0, e.pos-100):e.pos+100]}...")
            raise

        # Ensure it's a dict
        if not isinstance(parsed, dict):
            raise ValueError(f"Expected JSON object, got {type(parsed).__name__}")

        return parsed

    def validate_and_fix_edges(self, edges: list[dict], valid_persona_ids: set[str]) -> list[dict]:
        """Validate and fix edge persona IDs.

        Args:
            edges: List of edge dicts with source/target
            valid_persona_ids: Set of valid persona IDs

        Returns:
            List of validated edges with fixed IDs
        """
        validated_edges = []

        # Create a mapping for quick ID fixing (e.g., "linkedin_02" -> "linkedin_002")
        id_fix_map = {}
        for valid_id in valid_persona_ids:
            # Handle cases like "linkedin_002" or "x_001"
            if "_" in valid_id:
                parts = valid_id.rsplit("_", 1)
                if len(parts) == 2 and parts[1].isdigit():
                    platform, num = parts
                    # Map both 2-digit and 3-digit versions to the correct ID
                    # e.g., "linkedin_2" -> "linkedin_002"
                    # e.g., "linkedin_02" -> "linkedin_002"
                    num_int = int(num)
                    id_fix_map[f"{platform}_{num_int}"] = valid_id
                    id_fix_map[f"{platform}_{num_int:02d}"] = valid_id
                    id_fix_map[f"{platform}_{num_int:03d}"] = valid_id

        for edge in edges:
            source = edge.get("source", "")
            target = edge.get("target", "")

            # Skip if either ID is missing
            if not source or not target:
                continue

            # Fix IDs if needed
            if source in id_fix_map:
                source = id_fix_map[source]
            if target in id_fix_map:
                target = id_fix_map[target]

            # Check if both IDs are now valid
            if source in valid_persona_ids and target in valid_persona_ids:
                validated_edges.append({
                    **edge,
                    "source": source,
                    "target": target
                })

        return validated_edges

    def create_fallback_network(self, personas: list[dict]) -> dict:
        """Create a simple fallback network when AI generation fails.

        Args:
            personas: List of persona data

        Returns:
            Simple network with minimal connections
        """
        edges = []
        clusters = []
        influence_hubs = []

        # Create simple edges based on similar interests (first 5-10 connections)
        persona_ids = [p["persona_id"] for p in personas]

        # Create a few simple connections
        for i in range(min(len(personas) - 1, 10)):
            edges.append({
                "source": persona_ids[i],
                "target": persona_ids[i + 1],
                "strength": 0.5,
                "connection_type": "similar_interests"
            })

        # Create one cluster
        clusters.append({
            "cluster_id": "cluster_1",
            "members": persona_ids[:min(len(persona_ids), 10)],
            "description": "Default cluster"
        })

        # Mark first persona as influence hub
        if personas:
            influence_hubs.append({
                "persona_id": persona_ids[0],
                "influence_score": 0.7,
                "reach": len(persona_ids)
            })

        return {
            "edges": edges,
            "clusters": clusters,
            "influence_hubs": influence_hubs,
            "total_connections": len(edges),
            "network_density": 0.2,
            "is_fallback": True
        }

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

            # Generate network using Gemini 2.0 Flash-Lite
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.7,  # Moderate creativity for realistic variance
                model="gemini-2.0-flash-lite",
            )

            # Parse JSON response with cleaning
            try:
                persona_network = self._clean_json_response(response_text)
            except Exception as parse_error:
                print(f"[Node 2.5] Warning: JSON parsing failed ({parse_error}), using fallback network")
                persona_network = self.create_fallback_network(personas)

            # Validate and fix edges with correct persona IDs
            valid_persona_ids = set(p["persona_id"] for p in personas)
            original_edge_count = len(persona_network.get("edges", []))

            validated_edges = self.validate_and_fix_edges(
                persona_network.get("edges", []),
                valid_persona_ids
            )

            persona_network["edges"] = validated_edges

            fixed_count = original_edge_count - len(validated_edges)
            if fixed_count > 0:
                print(f"[Node 2.5] ⚠ Fixed/removed {fixed_count} edges with invalid persona IDs")

            # Validate network structure
            edge_count = len(persona_network.get("edges", []))
            cluster_count = len(persona_network.get("clusters", []))
            hub_count = len(persona_network.get("influence_hubs", []))

            is_fallback = persona_network.get("is_fallback", False)
            fallback_msg = " (fallback)" if is_fallback else ""

            print(
                f"[Node 2.5] ✓ Network generated{fallback_msg}: {edge_count} connections, "
                f"{cluster_count} clusters, {hub_count} influence hubs"
            )

            return {
                **state,
                "persona_network": persona_network,
                "status": "network_generation_complete",
            }

        except Exception as e:
            # Even on complete failure, provide fallback network
            error_msg = f"Network generation failed: {str(e)}"
            print(f"[Node 2.5] ⚠ {error_msg}, using fallback network")

            personas = state.get("personas", [])
            fallback_network = self.create_fallback_network(personas) if personas else {
                "edges": [],
                "clusters": [],
                "influence_hubs": [],
                "is_fallback": True
            }

            return {
                **state,
                "persona_network": fallback_network,
                "errors": state.get("errors", []) + [error_msg],
                "status": "network_generation_complete",  # Mark as complete even with fallback
            }


# Node instance
network_generation_node = NetworkGenerationNode()
