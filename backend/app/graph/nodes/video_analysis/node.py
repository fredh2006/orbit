"""Video Analysis Node - Analyzes video content using Gemini."""

import json
from pathlib import Path
from typing import Dict, Any

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client


class VideoAnalysisNode:
    """Node 1: Analyzes video content and extracts features."""

    def __init__(self):
        """Initialize the video analysis node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute video analysis.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with video_analysis populated
        """
        try:
            print(f"[Node 1] Analyzing video: {state['video_id']}")

            # Generate analysis using Gemini with video
            response_text = await gemini_client.generate_with_video(
                video_url=state["video_url"],
                prompt=self.prompt_template,
                temperature=0.3,  # Lower temperature for more consistent analysis
            )

            # Parse JSON response
            video_analysis = json.loads(response_text)

            print(
                f"[Node 1] ✓ Video analysis complete. Category: {video_analysis.get('content_category', 'unknown')}"
            )

            return {
                **state,
                "video_analysis": video_analysis,
                "status": "video_analysis_complete",
            }

        except Exception as e:
            error_msg = f"Video analysis failed: {str(e)}"
            print(f"[Node 1] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "video_analysis_failed",
            }


# Node instance
video_analysis_node = VideoAnalysisNode()
