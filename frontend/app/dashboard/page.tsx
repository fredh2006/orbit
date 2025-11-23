"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaInstagram, FaTiktok, FaVideo, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import OnboardingModal from "../components/OnboardingModal";

interface System {
  id: string;
  name: string;
  platform: string;
  metrics: {
    handle: string;
    followers: string;
    likes: string;
    views: string;
  };
  createdAt: string;
  videoCount: number;
}

export default function DashboardPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = () => {
    const systemsData = localStorage.getItem("orbit_systems");
    if (systemsData) {
      const parsedSystems = JSON.parse(systemsData);

      // Count videos for each system
      const videosData = localStorage.getItem("orbit_videos");
      const videos = videosData ? JSON.parse(videosData) : [];

      const systemsWithCounts = parsedSystems.map((system: System) => ({
        ...system,
        videoCount: videos.filter((v: any) => v.systemId === system.id).length,
      }));

      setSystems(systemsWithCounts);
    }
  };

  const handleCreateSystem = () => {
    setShowCreateModal(true);
  };

  const handleSystemCreated = () => {
    setShowCreateModal(false);
    loadSystems();
  };

  const handleSystemClick = (systemId: string) => {
    router.push(`/dashboard/${systemId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="font-space text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your systems and simulations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New System Card */}
          <button
            onClick={handleCreateSystem}
            className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:scale-105"
          >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-white/10 p-6 transition-all group-hover:bg-white/20">
                <FaPlus className="text-3xl text-zinc-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-space text-lg font-bold text-white">Create New System</h3>
                <p className="text-sm text-zinc-400 mt-1">Set up a new platform</p>
              </div>
            </div>
          </button>

          {/* Existing Systems */}
          {systems.map((system) => (
            <button
              key={system.id}
              onClick={() => handleSystemClick(system.id)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:scale-105 text-left"
            >
              {/* Platform Icon */}
              <div className="absolute top-4 right-4">
                {system.platform === "TikTok" && <FaTiktok className="text-2xl text-cyan-400" />}
                {system.platform === "Instagram" && <FaInstagram className="text-2xl text-pink-500" />}
                {system.platform === "LinkedIn" && <FaLinkedin className="text-2xl text-blue-500" />}
                {system.platform === "X" && <FaXTwitter className="text-2xl text-white" />}
              </div>

              {/* System Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-space text-xl font-bold text-white">{system.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{system.metrics.handle}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Followers</div>
                    <div className="text-sm font-bold text-white mt-1">{system.metrics.followers}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Likes</div>
                    <div className="text-sm font-bold text-white mt-1">{system.metrics.likes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Views</div>
                    <div className="text-sm font-bold text-white mt-1">{system.metrics.views}</div>
                  </div>
                </div>

                {/* Content Count */}
                <div className="flex items-center gap-2 pt-2">
                  <FaVideo className="text-zinc-500" />
                  <span className="text-sm text-zinc-400">
                    {system.videoCount} {system.platform === "LinkedIn" || system.platform === "X" ? (system.videoCount === 1 ? "post" : "posts") : (system.videoCount === 1 ? "video" : "videos")} simulated
                  </span>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </button>
          ))}
        </div>

        {/* Empty State */}
        {systems.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block rounded-full bg-white/5 p-6 mb-4">
              <FaPlus className="text-4xl text-zinc-600" />
            </div>
            <h3 className="font-space text-xl font-bold text-zinc-400 mb-2">No systems yet</h3>
            <p className="text-sm text-zinc-500 mb-6">Create your first system to get started</p>
            <button
              onClick={handleCreateSystem}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:bg-zinc-200"
            >
              <FaPlus />
              Create System
            </button>
          </div>
        )}
      </div>

      {/* Create System Modal */}
      {showCreateModal && (
        <OnboardingModal
          onClose={() => setShowCreateModal(false)}
          onComplete={handleSystemCreated}
          mode="create-system"
        />
      )}
    </div>
  );
}
