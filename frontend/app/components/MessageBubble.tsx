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
      className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-white text-black rounded-br-sm"
            : "bg-white/5 text-white rounded-bl-sm border border-white/10"
        }`}
      >
        <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </div>
        {message.timestamp && (
          <div
            className={`text-xs mt-1 ${
              isUser ? "text-black/60" : "text-zinc-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}
