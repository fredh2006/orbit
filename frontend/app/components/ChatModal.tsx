/**
 * ChatModal Component
 * Modal interface for chatting with personas from the network visualization
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import {
  getChatHistory,
  sendMessage,
  ChatMessage,
  clearChatHistory,
} from "../api/chat";

interface ChatModalProps {
  testId: string;
  personaId: string;
  personaName: string;
  personaAge?: number;
  personaOccupation?: string;
  onClose: () => void;
}

export default function ChatModal({
  testId,
  personaId,
  personaName,
  personaAge,
  personaOccupation,
  onClose,
}: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const history = await getChatHistory(testId, personaId);
        setMessages(history.messages);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load chat history"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [testId, personaId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);
    setError(null);

    try {
      const response = await sendMessage(testId, personaId, userMessage);

      // Add both user message and assistant response to local state
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString(),
        },
        response.message,
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
      // Restore the message in the input on error
      setInputMessage(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key to send
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clearing chat history
  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear this conversation?")) return;

    try {
      await clearChatHistory(testId, personaId);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("Failed to clear chat:", err);
      setError(
        err instanceof Error ? err.message : "Failed to clear chat history"
      );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 border-l border-blue-500/30 shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gray-900/90 border-b border-blue-500/30 p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-white">{personaName}</h2>
            {(personaAge || personaOccupation) && (
              <p className="text-sm text-gray-400 mt-1">
                {personaAge && `${personaAge} years old`}
                {personaAge && personaOccupation && " • "}
                {personaOccupation}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Clear chat history"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="font-semibold mb-2">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400 max-w-sm">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-semibold mb-2">Start a Conversation</p>
                <p className="text-sm">
                  Ask {personaName} about their reactions to the video, their
                  interests, or why they made certain decisions.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="text-blue-400">Try asking:</p>
                  <p className="bg-gray-800/50 border border-blue-500/20 rounded p-2">
                    &quot;Why did you decide to share this video?&quot;
                  </p>
                  <p className="bg-gray-800/50 border border-blue-500/20 rounded p-2">
                    &quot;What did you think about the content?&quot;
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Banner */}
        {error && messages.length > 0 && (
          <div className="bg-red-900/20 border-t border-red-500/30 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-gray-900/90 border-t border-blue-500/30 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${personaName}...`}
              disabled={isSending || isLoading}
              className="flex-1 bg-gray-800 text-white border border-blue-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
