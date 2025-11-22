/**
 * ChatModal Component
 * Modal interface for chatting with personas from the network visualization
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Trash2, X, Send } from "lucide-react";
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal - Minimalistic */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
        <div className="w-full max-w-2xl h-[600px] overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto animate-in zoom-in duration-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-white/5 px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-space text-base font-bold text-white">
                {personaName}
              </h2>
              {(personaAge || personaOccupation) && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {personaAge && `${personaAge}`}
                  {personaAge && personaOccupation && " • "}
                  {personaOccupation}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
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
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center text-red-400 bg-red-500/10 rounded-lg p-4 max-w-md">
                <p className="text-sm font-medium mb-1">Error</p>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center max-w-sm">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-white/5 p-5">
                    <MessageSquare className="w-10 h-10 text-zinc-600" />
                  </div>
                </div>
                <p className="text-base font-semibold text-white mb-2">Start Chatting</p>
                <p className="text-sm text-zinc-500 mb-5">
                  Ask about their reaction, interests, or decisions.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="bg-white/5 rounded-lg p-2.5 text-zinc-400 text-left">
                    &quot;Why did you share this video?&quot;
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 text-zinc-400 text-left">
                    &quot;What influenced your decision?&quot;
                  </div>
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
          <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-white/5 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${personaName}...`}
              disabled={isSending || isLoading}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || isLoading}
              className={`rounded-lg px-3.5 py-2.5 transition-all ${
                !inputMessage.trim() || isSending || isLoading
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in.zoom-in {
          animation: zoom-in 0.2s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-in.fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
