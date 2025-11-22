"""Platform Prediction Node - Predicts real-world platform performance."""

import json
import re
from pathlib import Path
from typing import Dict, Any

from app.graph.state import VideoTestState
from app.services.gemini_client import gemini_client


class PlatformPredictionNode:
    """Node 6: Predicts how the video will perform on the actual platform."""

    def __init__(self):
        """Initialize the platform prediction node."""
        self.prompt_path = Path(__file__).parent / "prompt.xml"
        self.prompt_template = gemini_client.load_prompt_template(self.prompt_path)

    def calculate_baseline_predictions(
        self, state: VideoTestState
    ) -> Dict[str, Any]:
        """Calculate baseline predictions using realistic scaling factors.

        Args:
            state: Current pipeline state

        Returns:
            Baseline prediction metrics
        """
        # Get simulation results
        final_metrics = state.get("final_metrics", {})
        platform_metrics = state.get("platform_metrics", {})
        platform = state.get("platform", "tiktok")

        # Parse user's follower count
        followers_str = platform_metrics.get("followers", "0") if platform_metrics else "0"
        followers = self._parse_metric(followers_str)

        # Get engagement rates from simulation
        sim_engagement_rate = final_metrics.get("engagement_rate", 0.0)
        sim_view_rate = final_metrics.get("view_rate", 0.0)

        # Platform-specific reach factors (not linear scaling!)
        # These account for algorithm, virality, discovery, etc.
        platform_factors = {
            "tiktok": {
                "organic_reach": 0.15,  # 15% of followers see it organically
                "algorithm_boost": 1.8,  # TikTok algorithm can 1.8x reach for good content
                "viral_threshold": 0.65,  # >65% engagement can go viral
                "viral_multiplier": 25,   # Viral videos reach 25x followers
            },
            "instagram": {
                "organic_reach": 0.10,   # 10% of followers (algorithm limits)
                "algorithm_boost": 1.3,
                "viral_threshold": 0.70,
                "viral_multiplier": 15,
            },
        }

        factors = platform_factors.get(platform, platform_factors["tiktok"])

        # Calculate base reach (organic followers who will see it)
        base_reach = int(followers * factors["organic_reach"])

        # Apply algorithm boost based on engagement quality
        if sim_engagement_rate > 0.5:  # Good engagement
            boosted_reach = int(base_reach * factors["algorithm_boost"])
        else:
            boosted_reach = base_reach

        # Check for viral potential
        is_viral = sim_engagement_rate >= factors["viral_threshold"]
        if is_viral:
            viral_reach = int(followers * factors["viral_multiplier"])
            total_views = max(boosted_reach, viral_reach)
        else:
            total_views = boosted_reach

        # Add some randomness/variance (±20%)
        import random
        variance = random.uniform(0.8, 1.2)
        total_views = int(total_views * variance)

        # Calculate engagement numbers (not linear to view count!)
        # Engagement rates decrease as view count increases
        view_engagement_decay = 0.85 if total_views > boosted_reach else 1.0

        predicted_likes = int(total_views * sim_engagement_rate * 0.7 * view_engagement_decay)
        predicted_comments = int(total_views * sim_engagement_rate * 0.15 * view_engagement_decay)
        predicted_shares = int(total_views * sim_engagement_rate * 0.10 * view_engagement_decay)

        # Calculate save rate (platform-specific)
        save_rate = 0.05 if platform == "instagram" else 0.08
        predicted_saves = int(total_views * save_rate)

        return {
            "baseline_views": total_views,
            "baseline_likes": predicted_likes,
            "baseline_comments": predicted_comments,
            "baseline_shares": predicted_shares,
            "baseline_saves": predicted_saves,
            "is_viral_potential": is_viral,
            "organic_reach": base_reach,
            "algorithm_boosted_reach": boosted_reach,
            "simulation_engagement_rate": sim_engagement_rate,
        }

    def _parse_metric(self, metric_str: str) -> int:
        """Parse metric string like '850K' or '22.1M' to integer.

        Args:
            metric_str: Metric string

        Returns:
            Integer value
        """
        if not metric_str:
            return 0

        metric_str = str(metric_str).strip().upper()

        # Handle K (thousands)
        if "K" in metric_str:
            return int(float(metric_str.replace("K", "")) * 1000)
        # Handle M (millions)
        elif "M" in metric_str:
            return int(float(metric_str.replace("M", "")) * 1_000_000)
        # Handle B (billions)
        elif "B" in metric_str:
            return int(float(metric_str.replace("B", "")) * 1_000_000_000)
        else:
            try:
                return int(float(metric_str))
            except:
                return 0

    def _format_number(self, num: int) -> str:
        """Format number with K/M/B suffix.

        Args:
            num: Number to format

        Returns:
            Formatted string
        """
        if num >= 1_000_000_000:
            return f"{num / 1_000_000_000:.1f}B"
        elif num >= 1_000_000:
            return f"{num / 1_000_000:.1f}M"
        elif num >= 1_000:
            return f"{num / 1_000:.1f}K"
        else:
            return str(num)

    def _clean_json_response(self, response_text: str) -> dict:
        """Clean and parse JSON response from Gemini API.

        Args:
            response_text: Raw response text from API

        Returns:
            Parsed JSON as dict
        """
        # Remove markdown code blocks if present
        cleaned = re.sub(r'^```json\s*', '', response_text.strip())
        cleaned = re.sub(r'\s*```$', '', cleaned)

        # Parse JSON
        parsed = json.loads(cleaned)

        # Ensure it's a dict
        if not isinstance(parsed, dict):
            raise ValueError(f"Expected JSON object, got {type(parsed).__name__}")

        return parsed

    async def execute(self, state: VideoTestState) -> Dict[str, Any]:
        """Execute platform prediction.

        Args:
            state: Current pipeline state

        Returns:
            Updated state with platform_predictions populated
        """
        try:
            print(f"\n{'='*70}")
            print(f"[Node 6] 🎯 Predicting Real-World Platform Performance...")
            print(f"{'='*70}\n")

            # Calculate baseline predictions
            baseline = self.calculate_baseline_predictions(state)

            # Gather all context for AI
            platform = state.get("platform", "tiktok")
            user_context = state.get("user_context", {})
            platform_metrics = state.get("platform_metrics", {})
            video_analysis = state.get("video_analysis", {})
            final_metrics = state.get("final_metrics", {})
            reaction_insights = state.get("reaction_insights", {})

            # Format the prompt with all data
            prompt = self.prompt_template.format(
                platform=platform,
                user_context=json.dumps(user_context, indent=2) if user_context else "{}",
                platform_metrics=json.dumps(platform_metrics, indent=2) if platform_metrics else "{}",
                video_analysis=json.dumps(video_analysis, indent=2),
                simulation_metrics=json.dumps(final_metrics, indent=2),
                reaction_insights=json.dumps(reaction_insights, indent=2),
                baseline_predictions=json.dumps(baseline, indent=2),
            )

            # Generate predictions using Gemini
            print("[Node 6] Analyzing simulation data and user metrics...")
            response_text = await gemini_client.generate_async(
                prompt=prompt,
                temperature=0.4,  # Lower temp for more consistent predictions
                model="gemini-2.0-flash-lite",
            )

            # Parse response
            try:
                ai_predictions = self._clean_json_response(response_text)
            except Exception as e:
                print(f"[Node 6] Warning: Could not parse AI response, using baseline only")
                ai_predictions = {}

            # Combine baseline with AI predictions
            platform_predictions = {
                **baseline,
                **ai_predictions,
                "prediction_method": "hybrid_ai_scaling",
            }

            # Print formatted results
            self._print_predictions(platform_predictions, platform)

            return {
                **state,
                "platform_predictions": platform_predictions,
                "status": "completed",
            }

        except Exception as e:
            import traceback
            error_msg = f"Platform prediction failed: {str(e)}"
            print(f"[Node 6] ✗ {error_msg}")
            traceback.print_exc()

            return {
                **state,
                "errors": state.get("errors", []) + [error_msg],
                "status": "platform_prediction_failed",
            }

    def _print_predictions(self, predictions: dict, platform: str):
        """Print formatted predictions to console.

        Args:
            predictions: Prediction data
            platform: Platform name
        """
        print(f"\n{'='*70}")
        print(f"📊 PREDICTED REAL-WORLD PERFORMANCE ON {platform.upper()}")
        print(f"{'='*70}\n")

        # Quantitative Metrics
        print("📈 QUANTITATIVE PREDICTIONS:")
        print(f"   Total Views:       {self._format_number(predictions.get('predicted_views', predictions.get('baseline_views', 0)))}")
        print(f"   Likes:             {self._format_number(predictions.get('predicted_likes', predictions.get('baseline_likes', 0)))}")
        print(f"   Comments:          {self._format_number(predictions.get('predicted_comments', predictions.get('baseline_comments', 0)))}")
        print(f"   Shares:            {self._format_number(predictions.get('predicted_shares', predictions.get('baseline_shares', 0)))}")

        if platform == "instagram":
            print(f"   Saves:             {self._format_number(predictions.get('predicted_saves', predictions.get('baseline_saves', 0)))}")

        engagement_rate = predictions.get('predicted_engagement_rate', 0)
        print(f"\n   Engagement Rate:   {engagement_rate*100:.1f}%")

        virality_score = predictions.get('virality_score', 0)
        print(f"   Virality Score:    {virality_score}/10")

        reach_estimate = predictions.get('reach_estimate', 'Unknown')
        print(f"   Estimated Reach:   {reach_estimate}")

        # Qualitative Insights
        print(f"\n💡 QUALITATIVE INSIGHTS:")

        performance_tier = predictions.get('performance_tier', 'Unknown')
        print(f"   Performance Tier:  {performance_tier}")

        strengths = predictions.get('content_strengths', [])
        if strengths:
            print(f"\n   ✅ Strengths:")
            for strength in strengths[:3]:
                print(f"      • {strength}")

        weaknesses = predictions.get('content_weaknesses', [])
        if weaknesses:
            print(f"\n   ⚠️  Areas for Improvement:")
            for weakness in weaknesses[:3]:
                print(f"      • {weakness}")

        recommendations = predictions.get('recommendations', [])
        if recommendations:
            print(f"\n   💡 Recommendations:")
            for rec in recommendations[:3]:
                print(f"      • {rec}")

        # Comparison to User's Average
        comparison = predictions.get('comparison_to_user_average', '')
        if comparison:
            print(f"\n   📊 vs Your Average: {comparison}")

        # Best time to post
        best_time = predictions.get('best_time_to_post', '')
        if best_time:
            print(f"   ⏰ Best Time to Post: {best_time}")

        print(f"\n{'='*70}\n")


# Node instance
platform_prediction_node = PlatformPredictionNode()
