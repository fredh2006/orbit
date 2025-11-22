/**
 * Chat API Client Module
 * Handles all communication with the chat backend endpoints
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  test_id: string;
  persona_id: string;
  persona_name: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  conversation_length: number;
}

export interface PersonaAvailableForChat {
  persona_id: string;
  name: string;
  age: number;
  occupation: string;
  initial_reaction_summary: string;
  second_reaction_summary: string;
  message_count: number;
}

export interface AvailablePersonasResponse {
  test_id: string;
  personas: PersonaAvailableForChat[];
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Get list of personas available for chat in a completed test
 */
export async function getAvailablePersonas(
  testId: string
): Promise<AvailablePersonasResponse> {
  const response = await fetch(
    `${API_BASE_URL}/test/${testId}/chat/personas`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Failed to get available personas: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get the full chat history with a persona
 */
export async function getChatHistory(
  testId: string,
  personaId: string
): Promise<ChatHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/test/${testId}/chat/${personaId}/history`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Failed to get chat history: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Send a message to a persona and get their response
 */
export async function sendMessage(
  testId: string,
  personaId: string,
  message: string
): Promise<SendMessageResponse> {
  const response = await fetch(
    `${API_BASE_URL}/test/${testId}/chat/${personaId}/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Failed to send message: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Clear the chat history with a persona
 */
export async function clearChatHistory(
  testId: string,
  personaId: string
): Promise<{ message: string; test_id: string }> {
  const response = await fetch(
    `${API_BASE_URL}/test/${testId}/chat/${personaId}/history`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Failed to clear chat history: ${response.statusText}`
    );
  }

  return response.json();
}
