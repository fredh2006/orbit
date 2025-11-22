"use client";

import React, { useState, useEffect } from "react";
import { FaInstagram, FaTiktok, FaArrowLeft } from "react-icons/fa";

// ... (MetricInput and MetricCard components remain unchanged)

const MetricInput = ({ 
  value, 
  onChange, 
  label, 
  defaultValue 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  label: string; 
  defaultValue: string 
}) => (
  <div className="text-center">
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        // Allow only numbers and decimals
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
          onChange(val);
        }
      }}
      onFocus={() => {
        if (value === defaultValue) onChange("");
      }}
      className="w-full bg-transparent text-center font-space text-lg font-bold text-zinc-400 hover:text-zinc-300 focus:text-white focus:outline-none focus:ring-0 border-b border-transparent focus:border-white/20 transition-colors placeholder-zinc-700"
      placeholder="0"
    />
    <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
  </div>
);

const MetricCard = ({ 
  platform, 
  metrics, 
  setMetrics,
  defaults
}: { 
  platform: string; 
  metrics: { handle: string; followers: string; likes: string; views: string };
  setMetrics: React.Dispatch<React.SetStateAction<{ handle: string; followers: string; likes: string; views: string }>>;
  defaults: { handle: string; followers: string; likes: string; views: string };
}) => (
  <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {platform === 'Instagram' ? (
          <FaInstagram className="text-pink-500" size={16} />
        ) : (
          <FaTiktok className="text-cyan-400" size={16} />
        )}
        <span className="font-space text-sm font-bold text-white">{platform}</span>
      </div>
      <input
        type="text"
        value={metrics.handle}
        onChange={(e) => setMetrics({ ...metrics, handle: e.target.value })}
        onFocus={() => {
          if (metrics.handle === defaults.handle) setMetrics({ ...metrics, handle: "" });
        }}
        className="bg-transparent text-right text-xs text-zinc-400 focus:outline-none focus:text-white transition-colors"
        placeholder="@handle"
      />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <MetricInput 
        label="Followers" 
        value={metrics.followers} 
        onChange={(val) => setMetrics({ ...metrics, followers: val })} 
        defaultValue={defaults.followers}
      />
      <MetricInput 
        label="Likes" 
        value={metrics.likes} 
        onChange={(val) => setMetrics({ ...metrics, likes: val })} 
        defaultValue={defaults.likes}
      />
      <MetricInput 
        label="Views" 
        value={metrics.views} 
        onChange={(val) => setMetrics({ ...metrics, views: val })} 
        defaultValue={defaults.views}
      />
    </div>
  </div>
);

const OnboardingModal = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  const DEFAULT_INSTAGRAM = {
    handle: "@orbit.user",
    followers: "1.2M",
    likes: "45.5M",
    views: "102M"
  };

  const DEFAULT_TIKTOK = {
    handle: "@orbit.tok",
    followers: "850K",
    likes: "22.1M",
    views: "89M"
  };

  // Social Metrics State
  const [instagramMetrics, setInstagramMetrics] = useState(DEFAULT_INSTAGRAM);
  const [tiktokMetrics, setTiktokMetrics] = useState(DEFAULT_TIKTOK);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = { 
      name, 
      email,
      socials: {
        instagram: instagramMetrics,
        tiktok: tiktokMetrics
      }
    };

    // Save to localStorage
    localStorage.setItem("orbit_user_data", JSON.stringify(userData));
    console.log("User Info Saved:", userData);
    
    // Move to next step
    setStep(2);
  };

  const togglePlatform = (platform: string) => {
    // Restrict to TikTok only for now
    if (platform === "Instagram") return;

    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFinalSubmit = () => {
    console.log("Selected Platforms:", selectedPlatforms);
    // Move to chat interface
    setStep(3);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected video file:", file);
      setIsUploading(true);

      try {
        // 1. Upload Video
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("http://127.0.0.1:8000/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const uploadData = await uploadResponse.json();
        console.log("Upload successful:", uploadData);

        // 2. Start Analysis
        const startTestResponse = await fetch("http://127.0.0.1:8000/api/v1/test/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_id: uploadData.video_id,
            video_url: uploadData.video_url,
            platform: "tiktok", // Hardcoded for now as per restriction
            simulation_params: {}
          }),
        });

        if (!startTestResponse.ok) {
          throw new Error("Analysis start failed");
        }

        const testData = await startTestResponse.json();
        console.log("Analysis started:", testData);
        
        // TODO: Handle success state (e.g., move to a results page or show a success message)
        alert(`Analysis started! Test ID: ${testData.test_id}`);

      } catch (error) {
        console.error("Error during upload/analysis:", error);
        alert("Failed to start analysis. Please check the console.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 relative">
        
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="absolute left-8 top-8 text-zinc-400 hover:text-white transition-colors z-20"
            aria-label="Go back"
          >
            <FaArrowLeft size={20} />
          </button>
        )}

        {step === 1 && (
          <>
            <div className="mb-8 text-center">
              <h2 className="mb-2 font-space text-4xl font-bold tracking-tight text-white">
                Welcome to Orbit
              </h2>
              <p className="text-sm text-zinc-400">
                Begin your journey through the cosmos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Social Presence</div>
                
                <MetricCard 
                  platform="Instagram" 
                  metrics={instagramMetrics}
                  setMetrics={setInstagramMetrics}
                  defaults={DEFAULT_INSTAGRAM}
                />
                
                <MetricCard 
                  platform="TikTok" 
                  metrics={tiktokMetrics}
                  setMetrics={setTiktokMetrics}
                  defaults={DEFAULT_TIKTOK}
                />
              </div>

              <button
                type="submit"
                className="group relative mt-4 w-full overflow-hidden rounded-xl bg-white px-4 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="relative z-10">Continue</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-300/50 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-8">
              <h2 className="mb-2 font-space text-3xl font-bold tracking-tight text-white">
                Create a System
              </h2>
              <p className="text-sm text-zinc-400">
                Select the platforms you want to integrate.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => togglePlatform("Instagram")}
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-all duration-300 opacity-50 cursor-not-allowed border-white/5 bg-white/5`}
              >
                <FaInstagram className="text-4xl text-zinc-600" />
                <span className="font-space font-bold text-zinc-600">Instagram</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-700">Coming Soon</span>
              </button>

              <button
                onClick={() => togglePlatform("TikTok")}
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-all duration-300 ${
                  selectedPlatforms.includes("TikTok")
                    ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_30px_-10px_rgba(34,211,238,0.5)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <FaTiktok className={`text-4xl transition-colors ${
                  selectedPlatforms.includes("TikTok") ? "text-cyan-400" : "text-zinc-400 group-hover:text-white"
                }`} />
                <span className={`font-space font-bold transition-colors ${
                  selectedPlatforms.includes("TikTok") ? "text-white" : "text-zinc-400 group-hover:text-white"
                }`}>TikTok</span>
              </button>
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={selectedPlatforms.length === 0}
              className={`group relative w-full overflow-hidden rounded-xl px-4 py-4 text-sm font-bold transition-all ${
                selectedPlatforms.length > 0
                  ? "bg-white text-black hover:scale-[1.02] hover:bg-zinc-200 cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <span className="relative z-10">Continue</span>
              {selectedPlatforms.length > 0 && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-300/50 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              )}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-8">
              <h2 className="mb-2 font-space text-3xl font-bold tracking-tight text-white">
                {isUploading ? "Analyzing Video..." : "Upload Your First Video"}
              </h2>
              <p className="text-sm text-zinc-400">
                {isUploading ? "Deciphering the cosmos..." : "Share your world with the galaxy."}
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="hidden"
            />
            
            <div className="flex justify-center mb-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="group flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-white/5 transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isUploading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 transition-colors group-hover:text-white">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
