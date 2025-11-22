/**
 * PersonaDetailModal Component
 * Shows detailed information about a persona with option to start chat
 * Follows the landing page modal theme
 */

"use client";

import React from "react";
import { Star, MapPin, Briefcase, Heart, MessageCircle, Share2, Zap, MessageSquare } from "lucide-react";

interface Persona {
  persona_id: string;
  name: string;
  age: number;
  location: string;
  gender: string;
  occupation: string;
  interests: string[];
}

interface Reaction {
  persona_id: string;
  engaged?: boolean;
  liked?: boolean;
  commented?: boolean;
  shared?: boolean;
  will_like?: boolean;
  will_comment?: boolean;
  will_share?: boolean;
  reason?: string;
  reasoning?: string;
  changed_from_initial?: boolean;
  influence_level?: string;
}

interface PersonaDetailModalProps {
  persona: Persona;
  reaction?: Reaction;
  onClose: () => void;
  onStartChat: () => void;
}

export default function PersonaDetailModal({
  persona,
  reaction,
  onClose,
  onStartChat,
}: PersonaDetailModalProps) {
  // Determine engagement status
  const isEngaged = reaction?.engaged || reaction?.will_like || reaction?.will_comment || reaction?.will_share;
  const hasShared = reaction?.shared || reaction?.will_share;
  const hasLiked = reaction?.liked || reaction?.will_like;
  const hasCommented = reaction?.commented || reaction?.will_comment;
  const reasoning = reaction?.reason || reaction?.reasoning;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal - Minimalistic */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto animate-in zoom-in duration-200">

          {/* Header */}
          <div className="p-6 text-center border-b border-white/5">
            <div className="mb-3 flex justify-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                hasShared
                  ? 'bg-amber-300/20'
                  : isEngaged
                  ? 'bg-white/10'
                  : 'bg-white/5'
              }`}>
                <Star className={`w-6 h-6 ${hasShared ? 'text-amber-300 fill-amber-300' : isEngaged ? 'text-white fill-white' : 'text-zinc-500'}`} />
              </div>
            </div>
            <h2 className="mb-1 font-space text-2xl font-bold text-white">
              {persona.name}
            </h2>
            <p className="text-xs text-zinc-400">
              {persona.age} • {persona.occupation}
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-zinc-500 mb-0.5">Location</div>
                <div className="text-sm text-white">{persona.location}</div>
              </div>
            </div>

            {/* Interests */}
            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-zinc-500 mb-1.5">Interests</div>
                <div className="flex flex-wrap gap-1.5">
                  {persona.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reaction Summary */}
            {reaction && (
              <div className="pt-4 border-t border-white/5">
                <div className="text-xs text-zinc-500 mb-2">Reaction</div>

                {/* Engagement Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hasLiked && (
                    <div className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs">
                      <Heart className="w-3 h-3 text-blue-400 fill-blue-400" />
                      <span className="text-blue-300">Liked</span>
                    </div>
                  )}
                  {hasCommented && (
                    <div className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs">
                      <MessageCircle className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-300">Commented</span>
                    </div>
                  )}
                  {hasShared && (
                    <div className="flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-1 text-xs">
                      <Share2 className="w-3 h-3 text-amber-300" />
                      <span className="text-amber-300">Shared</span>
                    </div>
                  )}
                  {!isEngaged && (
                    <span className="text-xs text-zinc-500">No engagement</span>
                  )}
                </div>

                {/* Reasoning */}
                {reasoning && (
                  <p className="text-xs text-zinc-400 italic leading-relaxed">
                    &quot;{reasoning}&quot;
                  </p>
                )}

                {/* Changed from initial */}
                {reaction.changed_from_initial && (
                  <div className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    <span>Influenced</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-white/5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:text-white hover:bg-white/5"
            >
              Close
            </button>
            <button
              onClick={onStartChat}
              className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
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
