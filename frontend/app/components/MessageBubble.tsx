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
      className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
          isUser
            ? "bg-white text-black"
            : "bg-white/5 text-white"
        }`}
      >
        <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </div>
        {message.timestamp && (
          <div
            className={`text-xs mt-1.5 ${
              isUser ? "text-black/50" : "text-zinc-600"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}
