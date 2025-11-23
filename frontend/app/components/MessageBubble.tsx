/**
 * MessageBubble Component
 * Displays individual chat messages with role-based styling
 */

import React from "react";
import { ChatMessage } from "../api/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isLoading = message.isLoading;

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-3 py-1.5 ${
          isUser
            ? "bg-white text-black"
            : "bg-white/5 text-white"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-1 py-1">
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <>
            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </div>
            {message.timestamp && (
              <div
                className={`text-[10px] mt-1 ${
                  isUser ? "text-black/40" : "text-zinc-600"
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
