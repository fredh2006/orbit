# Persona Chat Testing Guide

Quick guide to test the new persona chat feature.

## Quick Test with Mock Data

Run the test script with mock data (no server required):

```bash
cd backend
python test_chat.py
```

This loads mock data from `mock_chat_data.json` and tests the chat service directly.

## Prerequisites for API Testing
1. Backend server running (`uvicorn` or your start script)
2. At least one completed video test with test_id

## Testing Steps

### 1. Get Available Personas

```bash
curl http://localhost:8000/test/{YOUR_TEST_ID}/chat/personas
```

This returns a list of all personas from the test with their reaction summaries.

### 2. Send Your First Message

```bash
curl -X POST http://localhost:8000/test/{YOUR_TEST_ID}/chat/{PERSONA_ID}/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Why did you react to this video the way you did?"}'
```

### 3. Get Conversation History

```bash
curl http://localhost:8000/test/{YOUR_TEST_ID}/chat/{PERSONA_ID}/history
```

### 4. Continue the Conversation

```bash
curl -X POST http://localhost:8000/test/{YOUR_TEST_ID}/chat/{PERSONA_ID}/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What specifically in the video caught your attention?"}'
```

### 5. Test Streaming (Optional)

```bash
curl -X POST http://localhost:8000/test/{YOUR_TEST_ID}/chat/{PERSONA_ID}/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me more about your reaction"}' \
  -N
```

The `-N` flag disables buffering to see the stream in real-time.

### 6. Clear History (Optional)

```bash
curl -X DELETE http://localhost:8000/test/{YOUR_TEST_ID}/chat/{PERSONA_ID}/history
```

## Example Questions to Ask Personas

- "Why did you decide to share this video?"
- "What made you change your mind after seeing your friends' reactions?"
- "Did the video content align with your interests?"
- "How did you feel when you first saw this?"
- "Would you recommend this to your followers?"
- "What would make you more likely to engage with content like this?"

## Expected Behavior

✅ **Good Response:**
- In-character (uses persona's voice, background)
- References specific reactions (liked, shared, etc.)
- Mentions video content when relevant
- Shows influence of social network if applicable
- Conversational and natural

❌ **Issues to Watch For:**
- Generic responses not matching persona
- Ignoring previous conversation context
- Not referencing their actual reactions
- Breaking character

## Error Cases to Test

1. **Non-existent test:**
   ```bash
   curl http://localhost:8000/test/fake-test-id/chat/personas
   # Should return 404
   ```

2. **Incomplete test:**
   Try chatting with a test that's still running
   ```bash
   # Should return 400 with error about test not completed
   ```

3. **Invalid persona:**
   ```bash
   curl -X POST http://localhost:8000/test/{TEST_ID}/chat/fake-persona/message \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   # Should return 400 with persona not found error
   ```

## Integration with Frontend

If you're testing from the frontend, the flow would be:

1. After test completes, call `GET /chat/personas`
2. Display list of personas with their reaction summaries
3. User selects a persona to chat with
4. Show chat interface
5. On message send: `POST /chat/{persona_id}/message`
6. Display response in chat UI
7. Maintain conversation history locally or fetch with `GET /chat/{persona_id}/history`

## Tips for Good Conversations

- Start with open-ended questions
- Reference their reactions to get specific insights
- Ask about decision-making process
- Explore social influence factors
- Test personality consistency across multiple messages

## Debugging

If responses seem off:
1. Check the test has completed successfully
2. Verify persona has both initial and second reactions
3. Look at console logs for prompt being sent to Gemini
4. Check that GEMINI_API_KEY is set correctly

## Performance Notes

- Each message takes 2-5 seconds (LLM call time)
- Streaming endpoint may be faster for perceived performance
- Long conversations may hit token limits (implement truncation if needed)
- Rate limiting not yet implemented (use responsibly)
