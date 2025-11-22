"""Test script for persona chat functionality using mock data from JSON file."""

import asyncio
import json
from datetime import datetime
from pathlib import Path


def load_mock_data():
    """Load mock test data from JSON file."""
    mock_file = Path(__file__).parent / "mock_chat_data.json"
    with open(mock_file, "r") as f:
        data = json.load(f)

    # Add timestamps
    data["start_time"] = datetime.now().timestamp()
    data["end_time"] = datetime.now().timestamp() + 30
    data["duration"] = 30.0

    return data


async def test_chat():
    """Test chat functionality with mock data."""

    from app.api.routes import test_results_store
    from app.services.chat_service import chat_service
    from app.models.chat import ChatMessage

    print("\n" + "=" * 70)
    print("PERSONA CHAT TEST")
    print("=" * 70 + "\n")

    # Load mock data
    print("📦 Loading mock data from mock_chat_data.json...")
    mock_data = load_mock_data()
    test_id = mock_data["test_id"]
    test_results_store[test_id] = mock_data
    print(f"✅ Loaded test: {test_id}\n")

    # Get personas
    state = mock_data["state"]
    personas = state["personas"]
    print(f"👥 Available personas:")
    for p in personas:
        print(f"   - {p['name']} ({p['persona_id']}): {p['occupation']}, {p['age']}")
    print()

    # Test with Sarah Martinez
    persona_id = "persona_mock_001"
    persona = personas[0]
    print(f"💬 Starting chat with {persona['name']}...\n")

    # Build context
    initial = next(r for r in state["initial_reactions"] if r["persona_id"] == persona_id)
    second = next(r for r in state["second_reactions"] if r["persona_id"] == persona_id)

    context = chat_service.build_persona_context(
        persona=persona,
        video_analysis=state["video_analysis"],
        initial_reaction=initial,
        second_reaction=second,
        persona_network=state["persona_network"]
    )

    # Get chat history
    history = chat_service.get_or_create_chat_history(test_results_store, test_id, persona_id)

    # Question 1
    question1 = "Why did you decide to share this video with your followers?"
    print(f"❓ You: {question1}")

    try:
        response1 = await chat_service.generate_persona_response(
            context=context,
            chat_history=history,
            user_message=question1
        )
        print(f"💡 Sarah: {response1}\n")

        history.messages.append(ChatMessage(role="user", content=question1))
        history.messages.append(ChatMessage(role="assistant", content=response1))

        # Question 2
        question2 = "What specifically caught your attention in the video?"
        print(f"❓ You: {question2}")

        response2 = await chat_service.generate_persona_response(
            context=context,
            chat_history=history,
            user_message=question2
        )
        print(f"💡 Sarah: {response2}\n")

        history.messages.append(ChatMessage(role="user", content=question2))
        history.messages.append(ChatMessage(role="assistant", content=response2))

        print(f"✅ Chat test passed! ({len(history.messages)} messages)\n")

    except Exception as e:
        print(f"⚠️  Error: {e}")
        print("   (Make sure GEMINI_API_KEY is set in .env)\n")

    # Cleanup
    print("🧹 Cleaning up...")
    if test_id in test_results_store:
        del test_results_store[test_id]
    print("✅ Done!\n")


if __name__ == "__main__":
    asyncio.run(test_chat())
