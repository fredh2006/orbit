"use client";

import React, { useState, useEffect } from "react";
import { FaInstagram, FaTiktok, FaArrowLeft, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
}) => {
  const getIcon = () => {
    switch(platform) {
      case 'Instagram': return <FaInstagram className="text-pink-500" size={16} />;
      case 'TikTok': return <FaTiktok className="text-cyan-400" size={16} />;
      case 'LinkedIn': return <FaLinkedin className="text-blue-500" size={16} />;
      case 'X': return <FaTwitter className="text-white" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
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
};

interface OnboardingModalProps {
  onClose?: () => void;
  onComplete?: () => void;
  mode?: 'onboarding' | 'create-system';
}

const OnboardingModal = ({ onClose, onComplete, mode = 'onboarding' }: OnboardingModalProps = {}) => {
  const router = useRouter();
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

  const DEFAULT_LINKEDIN = {
    handle: "orbit-user",
    followers: "5.2K",
    likes: "1.5K",
    views: "12K"
  };

  const DEFAULT_X = {
    handle: "@orbit_x",
    followers: "12.5K",
    likes: "45K",
    views: "230K"
  };

  // Social Metrics State
  const [instagramMetrics, setInstagramMetrics] = useState(DEFAULT_INSTAGRAM);
  const [tiktokMetrics, setTiktokMetrics] = useState(DEFAULT_TIKTOK);
  const [linkedinMetrics, setLinkedinMetrics] = useState(DEFAULT_LINKEDIN);
  const [xMetrics, setXMetrics] = useState(DEFAULT_X);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
      name,
      email,
      socials: {
        instagram: instagramMetrics,
        tiktok: tiktokMetrics,
        linkedin: linkedinMetrics,
        x: xMetrics
      }
    };

    // Save to localStorage
    localStorage.setItem("orbit_user_data", JSON.stringify(userData));
    console.log("User Info Saved:", userData);
    
    // Move to next step
    setStep(2);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFinalSubmit = () => {
    console.log("Selected Platforms:", selectedPlatforms);

    if (mode === 'create-system') {
      // Create system mode - save to systems localStorage
      selectedPlatforms.forEach((platform) => {
        const systemMetrics =
          platform === "TikTok" ? tiktokMetrics :
          platform === "LinkedIn" ? linkedinMetrics :
          platform === "X" ? xMetrics :
          instagramMetrics;

        const newSystem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: `${platform} System`,
          platform,
          metrics: systemMetrics,
          createdAt: new Date().toISOString(),
        };

        // Load existing systems
        const existingSystems = localStorage.getItem("orbit_systems");
        const systems = existingSystems ? JSON.parse(existingSystems) : [];
        systems.push(newSystem);
        localStorage.setItem("orbit_systems", JSON.stringify(systems));

        console.log("System created:", newSystem);
      });

      // Call onComplete callback
      if (onComplete) {
        onComplete();
      }
    } else {
      // Original onboarding mode - move to video upload
      setStep(3);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected video file:", file);
      setSelectedFile(file);
    }
  };

  const handleEnterOrbit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setAnalysisStatus("Uploading video...");

    try {
      // 1. Upload Video
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("http://127.0.0.1:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload successful:", uploadData);

      // 2. Retrieve user data from localStorage
      const userDataString = localStorage.getItem("orbit_user_data");
      let user_context = null;
      let platform_metrics = null;

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log("Retrieved user data:", userData);

        // Build user context
        user_context = {
          name: userData.name,
          email: userData.email
        };

        // Extract platform-specific metrics (tiktok for now)
        const platform = "tiktok";
        if (userData.socials && userData.socials[platform]) {
          platform_metrics = userData.socials[platform];
          console.log(`Platform metrics for ${platform}:`, platform_metrics);
        }
      }

      setAnalysisStatus("Starting analysis...");

      // 3. Start Analysis
      const startTestResponse = await fetch("http://127.0.0.1:8000/api/v1/test/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: uploadData.video_id,
          video_url: uploadData.video_url,
          platform: "tiktok", // Hardcoded for now as per restriction
          simulation_params: {},
          user_context: user_context,
          platform_metrics: platform_metrics
        }),
      });

      if (!startTestResponse.ok) {
        throw new Error("Analysis start failed");
      }

      const testData = await startTestResponse.json();
      console.log("Analysis started:", testData);

      // 4. Create system if it doesn't exist and save video
      const platform = selectedPlatforms.includes("TikTok") ? "TikTok" : "Instagram";
      let systemId = null;

      // Check if system already exists for this platform
      const existingSystemsData = localStorage.getItem("orbit_systems");
      let systems = existingSystemsData ? JSON.parse(existingSystemsData) : [];

      let existingSystem = systems.find((s: any) => s.platform === platform);

      if (existingSystem) {
        systemId = existingSystem.id;
      } else {
        // Create new system
        const systemMetrics = platform === "TikTok" ? tiktokMetrics : instagramMetrics;
        const newSystem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: `${platform} System`,
          platform,
          metrics: systemMetrics,
          createdAt: new Date().toISOString(),
        };
        systems.push(newSystem);
        localStorage.setItem("orbit_systems", JSON.stringify(systems));
        systemId = newSystem.id;
        console.log("System created:", newSystem);
      }

      // 5. Save video to localStorage
      const newVideo = {
        id: Date.now().toString(),
        systemId: systemId,
        videoId: uploadData.video_id,
        videoUrl: uploadData.video_url,
        testId: testData.test_id,
        createdAt: new Date().toISOString(),
        status: "processing",
      };

      const existingVideos = localStorage.getItem("orbit_videos");
      const videos = existingVideos ? JSON.parse(existingVideos) : [];
      videos.push(newVideo);
      localStorage.setItem("orbit_videos", JSON.stringify(videos));
      console.log("Video saved:", newVideo);

      // 6. Store test data in localStorage for the network page
      localStorage.setItem("orbit_current_test", JSON.stringify(testData));

      // 7. Start polling for analysis completion
      setIsUploading(false);
      setIsAnalyzing(true);
      setAnalysisStatus("Analyzing video...");

      pollForCompletion(testData.test_id);

    } catch (error) {
      console.error("Error during upload/analysis:", error);
      alert("Failed to start analysis. Please check the console.");
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;

    setIsUploading(true);
    setAnalysisStatus("Starting analysis...");

    try {
      // 1. Retrieve user data from localStorage
      const userDataString = localStorage.getItem("orbit_user_data");
      let user_context = null;
      let platform_metrics = null;

      // Get the first selected platform (LinkedIn or X)
      const platform = selectedPlatforms.includes("LinkedIn") ? "linkedin" : "x";

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        user_context = {
          name: userData.name,
          email: userData.email
        };

        if (userData.socials && userData.socials[platform]) {
          platform_metrics = userData.socials[platform];
        }
      }

      // 2. Start Analysis with text content
      const textId = `text_${Date.now()}`;
      const startTestResponse = await fetch("http://127.0.0.1:8000/api/v1/test/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: textId,
          video_url: null,
          content_type: "text",
          text_content: textContent,
          platform: platform,
          simulation_params: {},
          user_context: user_context,
          platform_metrics: platform_metrics
        }),
      });

      if (!startTestResponse.ok) {
        throw new Error("Analysis start failed");
      }

      const testData = await startTestResponse.json();
      console.log("Text analysis started:", testData);

      // 3. Create system if it doesn't exist and save post
      const platformName = platform === "linkedin" ? "LinkedIn" : "X";
      let systemId = null;

      const existingSystemsData = localStorage.getItem("orbit_systems");
      let systems = existingSystemsData ? JSON.parse(existingSystemsData) : [];

      let existingSystem = systems.find((s: any) => s.platform === platformName);

      if (existingSystem) {
        systemId = existingSystem.id;
      } else {
        const systemMetrics = platform === "linkedin" ? linkedinMetrics : xMetrics;
        const newSystem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: `${platformName} System`,
          platform: platformName,
          metrics: systemMetrics,
          createdAt: new Date().toISOString(),
        };
        systems.push(newSystem);
        localStorage.setItem("orbit_systems", JSON.stringify(systems));
        systemId = newSystem.id;
        console.log("System created:", newSystem);
      }

      // 4. Save post to localStorage
      const newVideo = {
        id: Date.now().toString(),
        systemId: systemId,
        videoId: textId,
        videoUrl: null,
        testId: testData.test_id,
        createdAt: new Date().toISOString(),
        status: "processing",
      };

      const existingVideos = localStorage.getItem("orbit_videos");
      const videos = existingVideos ? JSON.parse(existingVideos) : [];
      videos.push(newVideo);
      localStorage.setItem("orbit_videos", JSON.stringify(videos));
      console.log("Post saved:", newVideo);

      // 5. Store test data in localStorage
      localStorage.setItem("orbit_current_test", JSON.stringify(testData));

      // 6. Start polling for analysis completion
      setIsUploading(false);
      setIsAnalyzing(true);
      setAnalysisStatus("Analyzing post...");

      pollForCompletion(testData.test_id);

    } catch (error) {
      console.error("Error during text analysis:", error);
      alert("Failed to start analysis. Please check the console.");
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const pollForCompletion = (testId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/test/${testId}/status`);

        if (!statusResponse.ok) {
          throw new Error(`Failed to get status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        console.log('Test status:', statusData);

        // Update status message
        if (statusData.status) {
          setAnalysisStatus(`Status: ${statusData.status}`);
        }

        // Check if complete
        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          setAnalysisStatus("Loading results...");

          // Fetch the full results before redirecting
          try {
            const resultsResponse = await fetch('http://127.0.0.1:8000/api/v1/test-results/latest');

            if (!resultsResponse.ok) {
              throw new Error(`Failed to load results: ${resultsResponse.status}`);
            }

            const resultsData = await resultsResponse.json();
            console.log('Results loaded, storing in localStorage');

            // Store the complete results in localStorage
            localStorage.setItem('orbit_network_data', JSON.stringify(resultsData));

            setAnalysisStatus("Complete! Loading visualization...");

            // Brief delay then redirect
            setTimeout(() => {
              setIsAnalyzing(false);

              // Navigate to network visualization or call completion callback
              if (onComplete) {
                onComplete();
              } else {
                router.push("/network");
              }
            }, 500);

          } catch (fetchErr: any) {
            throw new Error('Failed to fetch results: ' + fetchErr.message);
          }

        } else if (statusData.status === 'failed' || statusData.errors?.length > 0) {
          clearInterval(pollInterval);
          throw new Error('Analysis failed: ' + (statusData.errors?.[0] || 'Unknown error'));
        }
      } catch (err: any) {
        clearInterval(pollInterval);
        console.error('Error during polling:', err);
        alert('Analysis failed: ' + err.message);
        setIsAnalyzing(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`relative z-50 flex min-h-screen items-center justify-center px-4 py-12 ${mode === 'create-system' ? 'fixed inset-0 bg-black/80 backdrop-blur-sm' : ''}`}>
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 relative">

        {mode === 'create-system' && onClose && (
          <button
            onClick={onClose}
            className="absolute right-8 top-8 text-zinc-400 hover:text-white transition-colors z-20"
            aria-label="Close"
          >
            <span className="text-2xl">×</span>
          </button>
        )}

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

                <MetricCard
                  platform="LinkedIn"
                  metrics={linkedinMetrics}
                  setMetrics={setLinkedinMetrics}
                  defaults={DEFAULT_LINKEDIN}
                />

                <MetricCard
                  platform="X"
                  metrics={xMetrics}
                  setMetrics={setXMetrics}
                  defaults={DEFAULT_X}
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
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-all duration-300 ${
                  selectedPlatforms.includes("Instagram")
                    ? "border-pink-500 bg-pink-500/10 shadow-[0_0_30px_-10px_rgba(236,72,153,0.5)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <FaInstagram className={`text-4xl transition-colors ${
                  selectedPlatforms.includes("Instagram") ? "text-pink-500" : "text-zinc-400 group-hover:text-white"
                }`} />
                <span className={`font-space font-bold transition-colors ${
                  selectedPlatforms.includes("Instagram") ? "text-white" : "text-zinc-400 group-hover:text-white"
                }`}>Instagram</span>
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

              <button
                onClick={() => togglePlatform("LinkedIn")}
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-all duration-300 ${
                  selectedPlatforms.includes("LinkedIn")
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <FaLinkedin className={`text-4xl transition-colors ${
                  selectedPlatforms.includes("LinkedIn") ? "text-blue-500" : "text-zinc-400 group-hover:text-white"
                }`} />
                <span className={`font-space font-bold transition-colors ${
                  selectedPlatforms.includes("LinkedIn") ? "text-white" : "text-zinc-400 group-hover:text-white"
                }`}>LinkedIn</span>
              </button>

              <button
                onClick={() => togglePlatform("X")}
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-all duration-300 ${
                  selectedPlatforms.includes("X")
                    ? "border-white bg-white/10 shadow-[0_0_30px_-10px_rgba(255,255,255,0.5)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <FaTwitter className={`text-4xl transition-colors ${
                  selectedPlatforms.includes("X") ? "text-white" : "text-zinc-400 group-hover:text-white"
                }`} />
                <span className={`font-space font-bold transition-colors ${
                  selectedPlatforms.includes("X") ? "text-white" : "text-zinc-400 group-hover:text-white"
                }`}>X</span>
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

        {step === 3 && mode !== 'create-system' && (
          <>
            {/* Text Input for LinkedIn/X */}
            {(selectedPlatforms.includes("LinkedIn") || selectedPlatforms.includes("X")) && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-8">
                  <h2 className="mb-2 font-space text-3xl font-bold tracking-tight text-white">
                    {isAnalyzing ? "Analyzing Post..." : isUploading ? "Processing..." : "Create Your First Post"}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {isAnalyzing ? analysisStatus : isUploading ? "Starting analysis..." : `Write a ${selectedPlatforms.includes("LinkedIn") ? "LinkedIn" : "X"} post to analyze.`}
                  </p>
                </div>

                <div className="mb-8 space-y-6">
                  <div className="text-left">
                    <textarea
                      value={textContent}
                      onChange={(e) => {
                        if (e.target.value.length <= 3000) {
                          setTextContent(e.target.value);
                        }
                      }}
                      placeholder={selectedPlatforms.includes("LinkedIn") ? "Share your professional insights..." : "What's happening?"}
                      disabled={isUploading || isAnalyzing}
                      className="w-full h-48 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="mt-2 flex justify-between items-center text-xs text-zinc-500">
                      <span>
                        3000 character limit
                      </span>
                      <span className={textContent.length > 2800 ? "text-yellow-500" : ""}>
                        {textContent.length} / 3000
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleTextSubmit}
                    disabled={isUploading || isAnalyzing || !textContent.trim()}
                    className="group relative w-full overflow-hidden rounded-xl bg-white px-4 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isAnalyzing ? (
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Analyzing...
                      </span>
                    ) : isUploading ? (
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">Enter Orbit</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-300/50 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Video Upload for Instagram/TikTok */}
            {(selectedPlatforms.includes("Instagram") || selectedPlatforms.includes("TikTok")) && !selectedPlatforms.includes("LinkedIn") && !selectedPlatforms.includes("X") && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-8">
                  <h2 className="mb-2 font-space text-3xl font-bold tracking-tight text-white">
                    {isAnalyzing ? "Analyzing Video..." : isUploading ? "Uploading..." : "Upload Your First Video"}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {isAnalyzing ? analysisStatus : isUploading ? "Uploading to cosmos..." : "Share your world with the galaxy."}
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="hidden"
                />

                {!selectedFile ? (
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isAnalyzing}
                      className="group flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-white/5 transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isUploading || isAnalyzing ? (
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 transition-colors group-hover:text-white">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mb-8 space-y-6">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-left">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
                            File Name
                          </div>
                          <div className="text-white font-medium truncate mb-4">
                            {selectedFile.name}
                          </div>
                          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
                            File Size
                          </div>
                          <div className="text-white font-medium">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                        {!isAnalyzing && !isUploading && (
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-zinc-400 hover:text-white transition-colors p-2"
                            aria-label="Remove file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleEnterOrbit}
                      disabled={isUploading || isAnalyzing}
                      className="group relative w-full overflow-hidden rounded-xl bg-white px-4 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isAnalyzing ? (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                          Analyzing...
                        </span>
                      ) : isUploading ? (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                          Uploading...
                        </span>
                      ) : (
                        <>
                          <span className="relative z-10">Enter Orbit</span>
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-300/50 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
