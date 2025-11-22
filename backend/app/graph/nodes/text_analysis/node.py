"""Text Analysis Node - Analyzes text post content using Gemini."""

import json
from pathlib import Path
from typing import Dict, Any

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client


class TextAnalysisNode:
    """Node 1 Alternative: Analyzes text post content and extracts features."""

    def __init__(self):
        """Initialize the text analysis node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute text analysis.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with text_analysis populated
        """
        try:
            print(f"[Node 1 - Text] Analyzing text post: {state['video_id']}")
            print(f"[Node 1 - Text] Platform: {state['platform']}")

            # Get text content
            text_content = state.get('text_content', '')
            if not text_content:
                raise ValueError("No text content provided for text analysis")

            # Log user context and platform metrics
            user_context = state.get('user_context')
            platform_metrics = state.get('platform_metrics')

            if user_context:
                print(f"[Node 1 - Text] User Context received: {json.dumps(user_context, indent=2)}")
            else:
                print(f"[Node 1 - Text] No user context provided")

            if platform_metrics:
                print(f"[Node 1 - Text] Platform Metrics received: {json.dumps(platform_metrics, indent=2)}")
            else:
                print(f"[Node 1 - Text] No platform metrics provided")

            # Prepare prompt with text content
            full_prompt = self.prompt_template.replace("{TEXT_CONTENT}", text_content)

            # Generate analysis using Gemini
            response_text = await gemini_client.generate_async(
                prompt=full_prompt,
                temperature=0.3,  # Lower temperature for more consistent analysis
                json_mode=True,
            )

            # Parse JSON response
            text_analysis = json.loads(response_text)

            print(
                f"[Node 1 - Text] ✓ Text analysis complete. Category: {text_analysis.get('content_category', 'unknown')}"
            )

            return {
                **state,
                "text_analysis": text_analysis,
                "status": "text_analysis_complete",
            }

        except Exception as e:
            error_msg = f"Text analysis failed: {str(e)}"
            print(f"[Node 1 - Text] ✗ {error_msg}")

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "text_analysis_failed",
            }


# Node instance
text_analysis_node = TextAnalysisNode()
