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

      {/* Modal - Ultra Minimalistic */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
        <div className="w-full max-w-xl h-[550px] overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto animate-in zoom-in duration-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-white/5 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">
                {personaName}
              </h2>
            </div>
          </div>
          <div className="flex gap-0.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-t border-b border-zinc-500"></div>
            </div>
          ) : error && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center text-red-400 bg-red-500/5 rounded p-3 max-w-sm">
                <p className="text-xs font-medium mb-0.5">Error</p>
                <p className="text-xs text-red-300/80">{error}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center max-w-xs">
                <div className="flex justify-center mb-3">
                  <MessageSquare className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Start a conversation with {personaName}
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="bg-white/[0.02] rounded px-2.5 py-2 text-zinc-500 text-left">
                    &quot;Why did you share this?&quot;
                  </div>
                  <div className="bg-white/[0.02] rounded px-2.5 py-2 text-zinc-500 text-left">
                    &quot;What influenced you?&quot;
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
          <div className="bg-red-500/5 border-t border-red-500/10 px-3 py-1.5">
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-white/5 p-3">
          <div className="relative flex items-center rounded-full bg-white/5 px-4 transition-all focus-within:bg-white/10">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending || isLoading}
              className="flex-1 bg-transparent py-2.5 pr-2 text-sm text-white placeholder-zinc-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || isLoading}
              className={`flex-shrink-0 p-1 transition-colors ${
                !inputMessage.trim() || isSending || isLoading
                  ? 'text-zinc-700 cursor-not-allowed'
                  : 'text-white hover:text-zinc-200'
              }`}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-white"></div>
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
