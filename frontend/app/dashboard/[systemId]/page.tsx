"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaPlus, FaInstagram, FaTiktok, FaPlay, FaClock, FaChartLine, FaLinkedin, FaTwitter } from "react-icons/fa";

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
}

interface Video {
  id: string;
  systemId: string;
  videoId: string;
  videoUrl: string;
  testId: string;
  createdAt: string;
  status: string;
  results?: {
    engagement_rate?: number;
    total_views?: number;
    virality_score?: number;
  };
}

export default function SystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params.systemId as string;

  const [system, setSystem] = useState<System | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSystem();
    loadVideos();

    // Poll for test results every 5 seconds
    const pollInterval = setInterval(() => {
      checkAndUpdateTestResults();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [systemId]);

  const loadSystem = () => {
    const systemsData = localStorage.getItem("orbit_systems");
    if (systemsData) {
      const systems = JSON.parse(systemsData);
      const foundSystem = systems.find((s: System) => s.id === systemId);
      setSystem(foundSystem || null);
    }
  };

  const loadVideos = () => {
    const videosData = localStorage.getItem("orbit_videos");
    if (videosData) {
      const allVideos = JSON.parse(videosData);
      const systemVideos = allVideos.filter((v: Video) => v.systemId === systemId);
      setVideos(systemVideos);
    }
  };

  const checkAndUpdateTestResults = async () => {
    const videosData = localStorage.getItem("orbit_videos");
    if (!videosData) return;

    const allVideos = JSON.parse(videosData);
    const processingVideos = allVideos.filter(
      (v: Video) => v.systemId === systemId && v.status === "processing"
    );

    // Check each processing video
    for (const video of processingVideos) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/test/${video.testId}/results`);
        if (response.ok) {
          const results = await response.json();

          // Check if test is complete
          if (results.status === "completed") {
            // Update video with results
            const updatedVideos = allVideos.map((v: Video) => {
              if (v.testId === video.testId) {
                return {
                  ...v,
                  status: "complete",
                  results: {
                    engagement_rate: results.final_metrics?.engagement_rate || 0,
                    total_views: results.final_metrics?.total_views || 0,
                    virality_score: results.platform_predictions?.virality_score || 0,
                  },
                };
              }
              return v;
            });

            localStorage.setItem("orbit_videos", JSON.stringify(updatedVideos));
            loadVideos(); // Refresh the display
          }
        }
      } catch (error) {
        console.error(`Error checking test ${video.testId}:`, error);
      }
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !system) return;

    setIsUploading(true);

    try {
      // 1. Upload Video
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("http://127.0.0.1:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const uploadData = await uploadResponse.json();
      console.log("Upload successful:", uploadData);

      // 2. Get system data for this platform
      const platformMetrics = system.metrics;
      const user_context = {
        name: "User",  // You can enhance this later
        email: "",
      };

      // 3. Start Analysis
      const startTestResponse = await fetch("http://127.0.0.1:8000/api/v1/test/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: uploadData.video_id,
          video_url: uploadData.video_url,
          platform: system.platform.toLowerCase(),
          simulation_params: {},
          user_context: user_context,
          platform_metrics: platformMetrics,
        }),
      });

      if (!startTestResponse.ok) throw new Error("Analysis start failed");

      const testData = await startTestResponse.json();
      console.log("Analysis started:", testData);

      // 4. Save video to localStorage
      const newVideo: Video = {
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

      // Reload videos
      loadVideos();

      // Start polling for completion
      setIsUploading(false);
      setIsAnalyzing(true);
      setAnalysisStatus("Analyzing video...");
      setCurrentTestId(testData.test_id);
      pollForCompletion(testData.test_id);

    } catch (error) {
      console.error("Error during upload/analysis:", error);
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
            const resultsResponse = await fetch(`http://127.0.0.1:8000/api/v1/test/${testId}/results`);

            if (!resultsResponse.ok) {
              throw new Error(`Failed to load results: ${resultsResponse.status}`);
            }

            const resultsData = await resultsResponse.json();
            console.log('Results loaded, storing in localStorage');

            // Validate that we have the required data before storing
            if (!resultsData.personas || !Array.isArray(resultsData.personas) || resultsData.personas.length === 0) {
              throw new Error('Analysis completed but data is incomplete. Please try again.');
            }

            // Store the complete results in localStorage with testId
            const networkData = {
              ...resultsData,
              testId: testId
            };
            localStorage.setItem('orbit_network_data', JSON.stringify(networkData));
            localStorage.setItem(`orbit_network_${testId}`, JSON.stringify(networkData));

            setAnalysisStatus("Complete! Loading visualization...");

            // Brief delay then redirect to network
            setTimeout(() => {
              setIsAnalyzing(false);
              router.push(`/network?testId=${testId}`);
            }, 500);

          } catch (fetchErr: any) {
            throw new Error('Failed to fetch results: ' + fetchErr.message);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setIsAnalyzing(false);
        alert('Failed to track analysis progress. Please refresh and check results manually.');
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim() || !system) return;

    setIsUploading(true);

    try {
      // 1. Get system data for this platform
      const platformMetrics = system.metrics;
      const user_context = {
        name: "User",
        email: "",
      };

      // 2. Generate a unique ID for this text post
      const textId = `text_${Date.now()}`;

      // 3. Start Analysis with text content
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
          platform: system.platform.toLowerCase(),
          simulation_params: {},
          user_context: user_context,
          platform_metrics: platformMetrics,
        }),
      });

      if (!startTestResponse.ok) throw new Error("Analysis start failed");

      const testData = await startTestResponse.json();
      console.log("Text analysis started:", testData);

      // 4. Save text post to localStorage
      const newVideo: Video = {
        id: Date.now().toString(),
        systemId: systemId,
        videoId: textId,
        videoUrl: "", // No video URL for text posts
        testId: testData.test_id,
        createdAt: new Date().toISOString(),
        status: "processing",
      };

      const existingVideos = localStorage.getItem("orbit_videos");
      const videos = existingVideos ? JSON.parse(existingVideos) : [];
      videos.push(newVideo);
      localStorage.setItem("orbit_videos", JSON.stringify(videos));

      // Clear text and reload
      setTextContent("");
      setShowTextInput(false);
      loadVideos();

      // Start polling for completion
      setIsUploading(false);
      setIsAnalyzing(true);
      setAnalysisStatus("Analyzing post...");
      setCurrentTestId(testData.test_id);
      pollForCompletion(testData.test_id);

    } catch (error) {
      console.error("Error during text analysis:", error);
      alert("Failed to start analysis. Please check the console.");
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (!system) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-400">System not found</h2>
          <button
            onClick={handleBack}
            className="mt-4 text-sm text-zinc-500 hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Analysis Status Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-4" />
            <h3 className="font-space text-xl font-bold mb-2">{analysisStatus}</h3>
            <p className="text-sm text-zinc-400">Please wait while we analyze your content...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {system.platform === "TikTok" && (
                <div className="rounded-full bg-cyan-400/10 p-4">
                  <FaTiktok className="text-3xl text-cyan-400" />
                </div>
              )}
              {system.platform === "Instagram" && (
                <div className="rounded-full bg-pink-500/10 p-4">
                  <FaInstagram className="text-3xl text-pink-500" />
                </div>
              )}
              {system.platform === "LinkedIn" && (
                <div className="rounded-full bg-blue-500/10 p-4">
                  <FaLinkedin className="text-3xl text-blue-500" />
                </div>
              )}
              {system.platform === "X" && (
                <div className="rounded-full bg-white/10 p-4">
                  <FaTwitter className="text-3xl text-white" />
                </div>
              )}
              <div>
                <h1 className="font-space text-3xl font-bold">{system.name}</h1>
                <p className="text-sm text-zinc-400 mt-1">{system.metrics.handle}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-right">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Followers</div>
                <div className="text-lg font-bold text-white mt-1">{system.metrics.followers}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Likes</div>
                <div className="text-lg font-bold text-white mt-1">{system.metrics.likes}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Views</div>
                <div className="text-lg font-bold text-white mt-1">{system.metrics.views}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-space text-2xl font-bold">
            {system.platform === "LinkedIn" || system.platform === "X" ? "Simulated Posts" : "Simulated Videos"}
          </h2>
          <button
            onClick={() => {
              if (system.platform === "LinkedIn" || system.platform === "X") {
                setShowTextInput(true);
              } else {
                handleUploadClick();
              }
            }}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Analyzing...
              </>
            ) : (
              <>
                <FaPlus />
                {system.platform === "LinkedIn" || system.platform === "X" ? "Create Post" : "Add Video"}
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="video/*"
            className="hidden"
          />
        </div>

        {/* Text Input Modal for LinkedIn/X */}
        {showTextInput && (system.platform === "LinkedIn" || system.platform === "X") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
              <h3 className="font-space text-2xl font-bold mb-4">Create a Post</h3>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={`Write your ${system.platform} post here...`}
                className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                maxLength={system.platform === "X" ? 280 : 3000}
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-zinc-500">
                  {textContent.length} / {system.platform === "X" ? 280 : 3000} characters
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTextInput(false);
                      setTextContent("");
                    }}
                    className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTextSubmit}
                    disabled={!textContent.trim() || isUploading}
                    className="px-6 py-2 rounded-lg bg-white text-black font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              >
                {/* Video Preview */}
                <div className="aspect-video rounded-lg bg-zinc-900 mb-4 flex items-center justify-center overflow-hidden relative">
                  <video
                    src={video.videoUrl.startsWith('http') ? video.videoUrl : `http://127.0.0.1:8000${video.videoUrl}`}
                    className="w-full h-full object-contain"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaPlay className="text-4xl text-white" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Video ID</span>
                    <span className="text-xs font-mono text-zinc-400">{video.videoId.slice(0, 8)}...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaClock className="text-xs text-zinc-500" />
                    <span className="text-xs text-zinc-400">{formatDate(video.createdAt)}</span>
                  </div>

                  {video.results && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-zinc-500">Engagement</div>
                          <div className="text-sm font-bold text-white">
                            {(video.results.engagement_rate * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500">Virality</div>
                          <div className="text-sm font-bold text-white">
                            {video.results.virality_score}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => router.push(`/network?testId=${video.testId}`)}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
                  >
                    <FaChartLine />
                    View Results
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    video.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {video.status === "completed" ? "Complete" : "Processing"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block rounded-full bg-white/5 p-6 mb-4">
              <FaPlay className="text-4xl text-zinc-600" />
            </div>
            <h3 className="font-space text-xl font-bold text-zinc-400 mb-2">No videos yet</h3>
            <p className="text-sm text-zinc-500 mb-6">Upload your first video to simulate performance</p>
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:bg-zinc-200"
            >
              <FaPlus />
              Upload Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
