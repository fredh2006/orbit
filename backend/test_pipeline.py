#!/usr/bin/env python3
"""Test script for LangGraph video testing pipeline.

Usage:
    python test_pipeline.py [platform]

Example:
    python test_pipeline.py test
    python test_pipeline.py instagram
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

# HARDCODED VIDEO PATH (relative to this script)
DEFAULT_VIDEO_PATH = str(Path(__file__).parent / "videos" / "UGCVid1.MOV")


async def run_test(video_path: str, platform: str = "instagram"):
    """Run the LangGraph pipeline test.

    Args:
        video_path: Path to the video file
        platform: Platform to test (default: instagram)

    Returns:
        Final state with all results
    """
    print("\n" + "=" * 70)
    print("LANGGRAPH VIDEO TESTING PIPELINE - TEST RUN")
    print("=" * 70)
    print(f"Video: {video_path}")
    print(f"Platform: {platform}")
    print(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")

    # Create initial state
    initial_state: VideoTestState = {
        "video_id": f"test_{int(time.time())}",
        "video_url": video_path,
        "platform": platform,
        "simulation_params": {},
        "video_analysis": None,
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

        # Print summary metrics
        if final_state.get("final_metrics"):
            metrics = final_state["final_metrics"]
            print("\n📊 FINAL METRICS:")
            print(f"  Total Views: {metrics.get('total_views', 0)}")
            print(f"  Total Likes: {metrics.get('total_likes', 0)}")
            print(f"  Total Shares: {metrics.get('total_shares', 0)}")
            print(f"  Total Comments: {metrics.get('total_comments', 0)}")
            print(f"  Engagement Rate: {metrics.get('engagement_rate', 0) * 100:.1f}%")
            print(f"  Personas Changed: {metrics.get('personas_who_changed', 0)}")
            print(f"  Social Influence %: {metrics.get('social_influence_percentage', 0) * 100:.1f}%")

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
    filename = f"{platform}_{video_id}_{timestamp}.json"

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
    # Usage: python test_pipeline.py [platform]
    # Default video: UGCVid1.MOV
    # Default platform: test

    platform = sys.argv[1] if len(sys.argv) > 1 else "test"
    video_path = DEFAULT_VIDEO_PATH

    print(f"🎬 Using hardcoded video: {video_path}")
    print(f"📱 Testing on platform: {platform}\n")

    # Validate video file exists
    if not Path(video_path).exists():
        print(f"❌ Error: Video file not found: {video_path}")
        print(f"   Please ensure the video exists at this location.")
        sys.exit(1)

    # Validate platform
    valid_platforms = ["instagram", "tiktok", "twitter", "youtube", "test"]
    if platform not in valid_platforms:
        print(f"❌ Error: Invalid platform '{platform}'")
        print(f"   Valid platforms: {', '.join(valid_platforms)}")
        sys.exit(1)

    try:
        # Run the test
        final_state = await run_test(video_path, platform)

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
            print("=" * 70 + "\n")

    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
