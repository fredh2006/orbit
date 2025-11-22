#!/usr/bin/env python3
"""Test script for LinkedIn text post analysis pipeline.

Usage:
    python test_linkedin_text.py [platform]

Example:
    python test_linkedin_text.py linkedin
    python test_linkedin_text.py x
"""

import sys
import asyncio
import json
import time
from pathlib import Path
from datetime import datetime

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.graph.graph import video_test_graph
from app.graph.state import VideoTestState

# HARDCODED LINKEDIN POST
LINKEDIN_POST = """Excited to share that our team just launched a revolutionary AI-powered analytics platform!

After 8 months of hard work, we've built something that reduces data analysis time by 70%. Our beta users are already seeing incredible results.

Key features:
✅ Real-time insights
✅ Automated reporting
✅ Predictive analytics
✅ Seamless integrations

Huge shoutout to the amazing team who made this possible. This is just the beginning!

Interested in learning more? Drop a comment or DM me.

#AI #Analytics #ProductLaunch #Innovation #TechStartup"""

# HARDCODED X/TWITTER POST
X_POST = """Just launched our AI analytics platform! 🚀

8 months of work → 70% faster data analysis

✅ Real-time insights
✅ Automated reports
✅ Predictive analytics

Beta users loving it! DM for early access 👇

#AI #Analytics #Startup"""


async def run_test(text_content: str, platform: str = "linkedin"):
    """Run the LangGraph pipeline test with text content.

    Args:
        text_content: The text post content
        platform: Platform to test (linkedin or x)

    Returns:
        Final state with all results
    """
    print("\n" + "=" * 70)
    print("LANGGRAPH TEXT POST TESTING PIPELINE - TEST RUN")
    print("=" * 70)
    print(f"Platform: {platform}")
    print(f"Content type: text")
    print(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print("\n📝 Post Content:")
    print("-" * 70)
    print(text_content)
    print("-" * 70 + "\n")

    # Create initial state for text post
    initial_state: VideoTestState = {
        "video_id": f"text_{platform}_{int(time.time())}",
        "video_url": "",  # No video URL for text posts
        "platform": platform,
        "content_type": "text",
        "text_content": text_content,
        "simulation_params": {},
        "user_context": {
            "name": "Test User",
            "email": "test@example.com"
        },
        "platform_metrics": {
            "handle": f"@test_{platform}_user",
            "followers": "5.2K" if platform == "linkedin" else "12.5K",
            "likes": "1.5K" if platform == "linkedin" else "45K",
            "views": "12K" if platform == "linkedin" else "230K"
        },
        "video_analysis": None,
        "text_analysis": None,
        "personas": None,
        "initial_reactions": None,
        "persona_network": None,
        "interaction_results": None,
        "interaction_events": None,
        "second_reactions": None,
        "final_metrics": None,
        "node_graph_data": None,
        "engagement_timeline": None,
        "reaction_insights": None,
        "platform_predictions": None,
        "errors": [],
        "status": "initializing",
    }

    # Run the pipeline
    start_time = time.time()

    try:
        print("🚀 Starting LangGraph pipeline execution...\n")
        final_state = await video_test_graph.ainvoke(initial_state)
        execution_time = time.time() - start_time

        print("\n" + "=" * 70)
        print("✅ PIPELINE EXECUTION COMPLETE")
        print("=" * 70)
        print(f"Status: {final_state.get('status')}")
        print(f"Execution time: {execution_time:.2f} seconds")
        print(f"Errors: {len(final_state.get('errors', []))}")

        if final_state.get("errors"):
            print("\n⚠️  Errors encountered:")
            for error in final_state["errors"]:
                print(f"  - {error}")

        # Print text analysis results
        if final_state.get("text_analysis"):
            text_analysis = final_state["text_analysis"]
            print("\n📝 TEXT ANALYSIS:")
            print(f"  Category: {text_analysis.get('content_category', 'N/A')}")
            print(f"  Topics: {', '.join(text_analysis.get('topics_and_themes', []))}")

            if "sentiment_analysis" in text_analysis:
                sentiment = text_analysis["sentiment_analysis"]
                print(f"  Sentiment: {sentiment.get('overall_sentiment', 'N/A')}")
                print(f"  Mood: {sentiment.get('mood', 'N/A')}")

            if "engagement_potential" in text_analysis:
                engagement = text_analysis["engagement_potential"]
                print(f"  Hook Strength: {engagement.get('hook_strength', 0)}/100")
                print(f"  Shareability: {engagement.get('shareability', 0)}/100")

        # Print persona reaction summary
        if final_state.get("initial_reactions"):
            reactions = final_state["initial_reactions"]
            engaged = sum(1 for r in reactions if r.get("engagement_probability", 0) > 0.5)
            print(f"\n💬 INITIAL REACTIONS:")
            print(f"  Total personas: {len(reactions)}")
            print(f"  Engaged: {engaged}/{len(reactions)} ({engaged/len(reactions)*100:.1f}%)")

        # Print summary metrics
        if final_state.get("final_metrics"):
            metrics = final_state["final_metrics"]
            print("\n📊 FINAL METRICS:")
            print(f"  Total Views: {metrics.get('total_views', 0):,}")
            print(f"  Total Likes: {metrics.get('total_likes', 0):,}")
            print(f"  Total Shares: {metrics.get('total_shares', 0):,}")
            print(f"  Total Comments: {metrics.get('total_comments', 0):,}")
            print(f"  Engagement Rate: {metrics.get('engagement_rate', 0) * 100:.1f}%")
            print(f"  Personas Changed: {metrics.get('personas_who_changed', 0)}")
            print(f"  Social Influence %: {metrics.get('social_influence_percentage', 0) * 100:.1f}%")

        # Print platform predictions
        if final_state.get("platform_predictions"):
            predictions = final_state["platform_predictions"]
            print("\n🎯 PLATFORM PREDICTIONS:")
            print(f"  Virality Score: {predictions.get('virality_score', 0)}/10")
            print(f"  Predicted Reach: {predictions.get('predicted_reach', 'N/A')}")

        print("=" * 70 + "\n")

        return final_state

    except Exception as e:
        execution_time = time.time() - start_time
        print("\n" + "=" * 70)
        print("❌ PIPELINE EXECUTION FAILED")
        print("=" * 70)
        print(f"Error: {str(e)}")
        print(f"Execution time: {execution_time:.2f} seconds")
        print("=" * 70 + "\n")
        raise


def save_results(final_state: dict, output_dir: Path):
    """Save results to JSON file.

    Args:
        final_state: Final state from pipeline
        output_dir: Directory to save results

    Returns:
        Path to saved file
    """
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_id = final_state.get("video_id", "unknown")
    platform = final_state.get("platform", "unknown")
    filename = f"{platform}_text_{video_id}_{timestamp}.json"

    output_path = output_dir / filename

    # Save results
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_state, f, indent=2, default=str)

    print(f"💾 Results saved to: {output_path}")
    print(f"   File size: {output_path.stat().st_size / 1024:.1f} KB\n")

    return output_path


async def main():
    """Main test function."""
    # Parse command line arguments
    # Usage: python test_linkedin_text.py [platform]
    # Default platform: linkedin

    platform = sys.argv[1] if len(sys.argv) > 1 else "linkedin"

    # Select appropriate post content
    if platform == "x":
        text_content = X_POST
        print(f"📱 Testing X/Twitter text post")
    elif platform == "linkedin":
        text_content = LINKEDIN_POST
        print(f"📱 Testing LinkedIn text post")
    else:
        print(f"❌ Error: Invalid platform '{platform}'")
        print(f"   Valid platforms: linkedin, x")
        sys.exit(1)

    try:
        # Run the test
        final_state = await run_test(text_content, platform)

        # Save results
        output_dir = Path(__file__).parent / "test_results"
        output_path = save_results(final_state, output_dir)

        # Print success message
        print("✅ Test completed successfully!")
        print(f"\n📂 View results at: {output_path}")

        # Print quick summary
        if final_state.get("final_metrics"):
            print("\n" + "=" * 70)
            print("QUICK SUMMARY")
            print("=" * 70)
            metrics = final_state["final_metrics"]
            personas_count = len(final_state.get("personas", []))
            print(f"Platform: {platform}")
            print(f"Personas tested: {personas_count}")
            print(f"Engagement rate: {metrics.get('engagement_rate', 0) * 100:.1f}%")
            print(f"Social influence impact: {metrics.get('social_influence_percentage', 0) * 100:.1f}%")

            # Show text analysis summary
            if final_state.get("text_analysis"):
                text_analysis = final_state["text_analysis"]
                print(f"Content category: {text_analysis.get('content_category', 'N/A')}")
                if "sentiment_analysis" in text_analysis:
                    print(f"Sentiment: {text_analysis['sentiment_analysis'].get('overall_sentiment', 'N/A')}")

            print("=" * 70 + "\n")

    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
