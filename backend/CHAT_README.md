# Persona Chat Feature

## Quick Start

Test the chat feature with mock data:

```bash
python test_chat.py
```

## Files

### Core Implementation
- `app/models/chat.py` - Chat data models
- `app/services/chat_service.py` - Chat service logic
- `app/api/routes.py` - Chat API endpoints (updated)
- `app/api/schemas.py` - Chat request/response schemas (updated)

### Testing
- `mock_chat_data.json` - Mock test data with 2 personas
- `test_chat.py` - Test script that loads mock data

### Documentation
- `CHAT_TESTING_GUIDE.md` - API testing guide
- `Documentation/analysis/2025-11-22/PLAN_PERSONA_CHAT.md` - Implementation plan
- `Documentation/analysis/2025-11-22/IMPLEMENTATION_SUMMARY.md` - Full summary

## API Endpoints

- `GET /test/{test_id}/chat/personas` - List personas
- `POST /test/{test_id}/chat/{persona_id}/message` - Send message
- `POST /test/{test_id}/chat/{persona_id}/stream` - Stream response
- `GET /test/{test_id}/chat/{persona_id}/history` - Get history
- `DELETE /test/{test_id}/chat/{persona_id}/history` - Clear history

## Mock Data

The `mock_chat_data.json` contains:
- **Test ID**: `test_chat_mock_001`
- **Personas**:
  - Sarah Martinez (Fashion Designer, 28) - engaged and shared
  - Marcus Chen (Software Engineer, 34) - initially neutral, influenced to like
- **Video**: Sustainable fashion tutorial
