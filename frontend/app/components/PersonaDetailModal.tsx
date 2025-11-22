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

      {/* Modal - matching landing page theme */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto animate-in zoom-in duration-200">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                hasShared
                  ? 'bg-white/20 shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]'
                  : isEngaged
                  ? 'bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5'
              }`}>
                <Star className={`w-8 h-8 ${hasShared ? 'text-amber-300 fill-amber-300' : isEngaged ? 'text-white fill-white' : 'text-zinc-500'}`} />
              </div>
            </div>
            <h2 className="mb-2 font-space text-3xl font-bold tracking-tight text-white">
              {persona.name}
            </h2>
            <p className="text-sm text-zinc-400">
              {persona.age} • {persona.gender} • {persona.occupation}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            {/* Location */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Location
              </div>
              <div className="text-white">{persona.location}</div>
            </div>

            {/* Occupation */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                Occupation
              </div>
              <div className="text-white">{persona.occupation}</div>
            </div>

            {/* Interests */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                <Heart className="w-3 h-3" />
                Interests
              </div>
              <div className="flex flex-wrap gap-2">
                {persona.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-white/10 px-3 py-1 text-sm text-zinc-300 border border-white/5"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Reaction Summary */}
            {reaction && (
              <div className={`rounded-xl border p-4 ${
                isEngaged
                  ? 'border-blue-500/30 bg-blue-500/10'
                  : 'border-white/5 bg-white/5'
              }`}>
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
                  Video Reaction
                </div>

                {/* Engagement Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {hasLiked && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm border border-white/10">
                      <Heart className="w-4 h-4 text-blue-400 fill-blue-400" />
                      <span className="text-blue-300">Liked</span>
                    </div>
                  )}
                  {hasCommented && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm border border-white/10">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">Commented</span>
                    </div>
                  )}
                  {hasShared && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-3 py-1.5 text-sm border border-amber-400/30">
                      <Share2 className="w-4 h-4 text-amber-300" />
                      <span className="text-amber-300 font-semibold">Shared</span>
                    </div>
                  )}
                  {!isEngaged && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm border border-white/5">
                      <span className="text-zinc-500">No engagement</span>
                    </div>
                  )}
                </div>

                {/* Reasoning */}
                {reasoning && (
                  <div className="rounded-lg bg-white/5 p-3 border-l-2 border-blue-500/50">
                    <p className="text-sm text-zinc-300 italic">
                      &quot;{reasoning}&quot;
                    </p>
                  </div>
                )}

                {/* Changed from initial */}
                {reaction.changed_from_initial && (
                  <div className="mt-3 text-xs text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Changed after social influence</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:border-white/20 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={onStartChat}
              className="group relative flex-1 overflow-hidden rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Start Chat
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-300/50 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
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
