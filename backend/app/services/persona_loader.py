"""Service for loading persona data from JSON files."""

import json
import os
from typing import List
from pathlib import Path

from app.models.persona import Persona


class PersonaLoader:
    """Handles loading and caching of persona data."""

    def __init__(self, data_dir: str = None):
        """Initialize the persona loader.

        Args:
            data_dir: Directory containing persona JSON files.
                     Defaults to app/data/personas/
        """
        if data_dir is None:
            # Get the app directory (parent of services directory)
            app_dir = Path(__file__).parent.parent
            data_dir = app_dir / "data" / "personas"

        self.data_dir = Path(data_dir)
        self._persona_cache: dict[str, List[Persona]] = {}

    def load_personas(self, platform: str) -> List[Persona]:
        """Load personas for a specific platform.

        Args:
            platform: Platform name (instagram, tiktok, twitter, youtube)

        Returns:
            List of Persona objects

        Raises:
            FileNotFoundError: If persona file doesn't exist
            ValueError: If JSON is invalid or doesn't match schema
        """
        # Check cache first
        if platform in self._persona_cache:
            print(f"[PersonaLoader] Using cached personas for platform: {platform} ({len(self._persona_cache[platform])} personas)")
            return self._persona_cache[platform]

        # Load from file
        file_path = self.data_dir / f"{platform}.json"

        print(f"[PersonaLoader] Loading personas for platform: {platform}")
        print(f"[PersonaLoader] File path: {file_path}")

        if not file_path.exists():
            print(f"[PersonaLoader] ✗ Persona file not found: {file_path}")
            raise FileNotFoundError(
                f"Persona file not found: {file_path}\n"
                f"Please create {platform}.json in {self.data_dir}"
            )

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            print(f"[PersonaLoader] Successfully read JSON file with {len(data)} personas")

            # Validate and convert to Persona objects
            personas = [Persona(**persona_data) for persona_data in data]

            print(f"[PersonaLoader] ✓ Successfully validated and loaded {len(personas)} personas")

            # Cache the results
            self._persona_cache[platform] = personas

            return personas

        except json.JSONDecodeError as e:
            print(f"[PersonaLoader] ✗ Invalid JSON in {file_path}: {e}")
            raise ValueError(f"Invalid JSON in {file_path}: {e}")
        except Exception as e:
            print(f"[PersonaLoader] ✗ Error loading personas from {file_path}: {e}")
            raise ValueError(f"Error loading personas from {file_path}: {e}")

    def get_persona_count(self, platform: str) -> int:
        """Get the number of personas for a platform without loading all data.

        Args:
            platform: Platform name

        Returns:
            Number of personas
        """
        if platform in self._persona_cache:
            return len(self._persona_cache[platform])

        personas = self.load_personas(platform)
        return len(personas)

    def clear_cache(self):
        """Clear the persona cache."""
        self._persona_cache.clear()

    def get_available_platforms(self) -> List[str]:
        """Get list of platforms with persona data available.

        Returns:
            List of platform names
        """
        if not self.data_dir.exists():
            return []

        platforms = []
        for file in self.data_dir.glob("*.json"):
            platform_name = file.stem  # filename without extension
            platforms.append(platform_name)

        return platforms


# Global instance
persona_loader = PersonaLoader()
