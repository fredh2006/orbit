"""Chat service for persona conversations."""

from typing import Dict, Optional, List, AsyncGenerator
from datetime import datetime
from fastapi import HTTPException

from app.models.chat import ChatMessage, ChatHistory, ChatContext
from app.services.gemini_client import gemini_client


class ChatService:
    """Service for managing persona chat functionality."""

    def __init__(self):
        """Initialize the chat service."""
        self.gemini = gemini_client

    def build_persona_context(
        self,
        persona: dict,
        video_analysis: Optional[dict],
        initial_reaction: Optional[dict],
        second_reaction: Optional[dict],
        persona_network: Optional[dict],
    ) -> ChatContext:
        """Build complete context for a persona chat.

        Args:
            persona: Persona profile data
            video_analysis: Video analysis results from Node 1
            initial_reaction: Persona's initial reaction from Node 2
            second_reaction: Persona's second reaction from Node 4
            persona_network: Network data from Node 2.5

        Returns:
            ChatContext with all relevant information
        """
        # Extract network context for this persona
        network_context = None
        if persona_network and persona:
            persona_id = persona.get("persona_id")
            # Build simplified network context
            network_context = {
                "has_network_data": True,
                "persona_id": persona_id,
            }
            # Add relevant network info if available
            if isinstance(persona_network, dict):
                network_context["network_summary"] = f"Part of a social network"

        return ChatContext(
            persona=persona,
            video_analysis=video_analysis,
            initial_reaction=initial_reaction,
            second_reaction=second_reaction,
            network_context=network_context,
        )

    def validate_chat_availability(
        self, test_results_store: Dict, test_id: str, persona_id: str
    ) -> tuple[bool, Optional[str]]:
        """Validate that chat is available for this test and persona.

        Args:
            test_results_store: The test results storage
            test_id: Test identifier
            persona_id: Persona identifier

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check test exists
        if test_id not in test_results_store:
            return False, f"Test {test_id} not found"

        test_data = test_results_store[test_id]
        state = test_data.get("state", {})

        # Check test is complete
        status = state.get("status", "")
        if status != "completed":
            return False, f"Test {test_id} is not completed (status: {status})"

        # Check persona exists
        personas = state.get("personas", [])
        persona_exists = any(p.get("persona_id") == persona_id for p in personas)

        if not persona_exists:
            return False, f"Persona {persona_id} not found in test {test_id}"

        return True, None

    def get_or_create_chat_history(
        self, test_results_store: Dict, test_id: str, persona_id: str
    ) -> ChatHistory:
        """Get existing chat history or create new one.

        Args:
            test_results_store: The test results storage
            test_id: Test identifier
            persona_id: Persona identifier

        Returns:
            ChatHistory for this conversation
        """
        test_data = test_results_store[test_id]

        # Initialize chat_histories if not exists
        if "chat_histories" not in test_data:
            test_data["chat_histories"] = {}

        # Get or create history for this persona
        if persona_id not in test_data["chat_histories"]:
            test_data["chat_histories"][persona_id] = ChatHistory(
                test_id=test_id, persona_id=persona_id, messages=[]
            )

        return test_data["chat_histories"][persona_id]

    def format_messages_for_llm(
        self, context: ChatContext, chat_history: ChatHistory
    ) -> str:
        """Format chat history and context into a prompt for the LLM.

        Args:
            context: Persona context (profile, reactions, video)
            chat_history: Conversation history

        Returns:
            Formatted prompt string
        """
        # Build system prompt with persona context
        system_prompt = self._build_system_prompt(context)

        # Format conversation history
        conversation = ""
        for msg in chat_history.messages:
            role = "User" if msg.role == "user" else "You"
            conversation += f"{role}: {msg.content}\n\n"

        # Combine into full prompt
        full_prompt = f"""{system_prompt}

CONVERSATION HISTORY:
{conversation if conversation else "(No previous messages)"}

Instructions:
- Respond as {context.persona.get('name', 'this persona')}
- Stay in character based on your personality and background
- Reference specific details from your reactions when relevant
- Be conversational and authentic
- Keep responses concise (2-4 sentences unless more detail is needed)
"""

        return full_prompt

    def _build_system_prompt(self, context: ChatContext) -> str:
        """Build the system prompt with persona context.

        Args:
            context: Persona context

        Returns:
            System prompt string
        """
        persona = context.persona
        video = context.video_analysis or {}
        initial = context.initial_reaction or {}
        second = context.second_reaction or {}

        # Build persona identity
        identity = f"""You are {persona.get('name', 'a persona')}, a {persona.get('age')}-year-old {persona.get('occupation')} from {persona.get('location')}.

ABOUT YOU:
- Gender: {persona.get('gender')}
- Education: {persona.get('education')}
- Income: {persona.get('income_level')}
- Interests: {', '.join(persona.get('interests', []))}
- Personality: {', '.join(persona.get('personality_traits', []))}
- Platform: {persona.get('platform')} user (spend {persona.get('platform_usage_hours', 0)} hours/day)
"""

        # Build video context
        video_context = ""
        if video:
            video_context = f"""
VIDEO YOU WATCHED:
- Content Type: {video.get('content_type', 'unknown')}
- Main Topics: {', '.join(video.get('topics', []))}
- Sentiment: {video.get('overall_sentiment', 'neutral')}
- Duration: {video.get('duration_seconds', 'unknown')} seconds
"""

        # Build reaction context
        reaction_context = ""
        if initial:
            initial_actions = []
            if initial.get("will_view"):
                initial_actions.append("watched")
            if initial.get("will_like"):
                initial_actions.append("liked")
            if initial.get("will_share"):
                initial_actions.append("shared")
            if initial.get("will_comment"):
                initial_actions.append("commented")

            reaction_context = f"""
YOUR INITIAL REACTION:
- Actions: {', '.join(initial_actions) if initial_actions else 'did not engage'}
- Sentiment: {initial.get('sentiment', 'neutral')}
- Your reasoning: "{initial.get('reasoning', 'No specific reason')}"
"""

        # Build second reaction context
        second_context = ""
        if second:
            second_actions = []
            if second.get("will_like"):
                second_actions.append("liked")
            if second.get("will_share"):
                second_actions.append("shared")
            if second.get("will_comment"):
                second_actions.append("commented")

            changed = second.get("changed_from_initial", False)
            change_note = " (changed from initial)" if changed else " (stayed the same)"

            second_context = f"""
YOUR REACTION AFTER SEEING OTHERS:
- Actions: {', '.join(second_actions) if second_actions else 'did not engage'}{change_note}
- Updated sentiment: {second.get('updated_sentiment', 'neutral')}
- Your reasoning: "{second.get('reasoning', 'No specific reason')}"
- Influence level: {second.get('influence_level', 0):.0%}
- Social factors: {', '.join(second.get('social_proof_factors', []))}
"""

        return f"""{identity}{video_context}{reaction_context}{second_context}

You are now chatting with someone who wants to understand your perspective on this video.
"""

    async def generate_persona_response(
        self, context: ChatContext, chat_history: ChatHistory, user_message: str
    ) -> str:
        """Generate a response from the persona.

        Args:
            context: Persona context
            chat_history: Conversation history
            user_message: The user's new message

        Returns:
            Persona's response text
        """
        # Add user message to history for context
        temp_history = ChatHistory(
            test_id=chat_history.test_id,
            persona_id=chat_history.persona_id,
            messages=chat_history.messages
            + [ChatMessage(role="user", content=user_message)],
        )

        # Format prompt
        prompt = self.format_messages_for_llm(context, temp_history)

        # Generate response (non-JSON mode for natural conversation)
        response = await self.gemini.generate_async(
            prompt=prompt, temperature=0.8, json_mode=False
        )

        return response.strip()

    async def stream_persona_response(
        self, context: ChatContext, chat_history: ChatHistory, user_message: str
    ) -> AsyncGenerator[str, None]:
        """Stream a response from the persona (for future streaming support).

        Args:
            context: Persona context
            chat_history: Conversation history
            user_message: The user's new message

        Yields:
            Chunks of the persona's response
        """
        # For now, use non-streaming and yield the full response
        # This can be enhanced later with actual streaming
        response = await self.generate_persona_response(
            context, chat_history, user_message
        )
        yield response


# Global instance
chat_service = ChatService()
