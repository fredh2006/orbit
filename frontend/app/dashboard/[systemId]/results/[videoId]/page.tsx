"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaPlay, FaChartLine, FaUsers, FaFire, FaEye, FaHeart, FaShare, FaComment } from "react-icons/fa";

interface TestResults {
  video_id: string;
  platform: string;
  status: string;
  video_analysis?: any;
  final_metrics?: any;
  platform_predictions?: any;
  personas?: any[];
  initial_reactions?: any[];
  second_reactions?: any[];
  node_graph_data?: any;
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const systemId = params.systemId as string;
  const videoId = params.videoId as string;

  const [results, setResults] = useState<TestResults | null>(null);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoRotation, setVideoRotation] = useState(0);

  useEffect(() => {
    loadVideoAndResults();
  }, [videoId]);

  const loadVideoAndResults = async () => {
    try {
      // Load video from localStorage
      const videosData = localStorage.getItem("orbit_videos");
      if (videosData) {
        const videos = JSON.parse(videosData);
        const foundVideo = videos.find((v: any) => v.id === videoId);
        setVideo(foundVideo);

        if (foundVideo && foundVideo.testId) {
          // Fetch results from backend
          const response = await fetch(`http://127.0.0.1:8000/api/v1/test/${foundVideo.testId}/results`);
          if (response.ok) {
            const data = await response.json();
            setResults(data);
          }
        }
      }
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/${systemId}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-4" />
          <p className="text-zinc-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results || !video) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-400">Results not found</h2>
          <button onClick={handleBack} className="mt-4 text-sm text-zinc-500 hover:text-white">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const predictions = results.platform_predictions || {};
  const metrics = results.final_metrics || {};

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft />
            Back to Videos
          </button>
          <h1 className="font-space text-3xl font-bold">Simulation Results</h1>
          <p className="text-sm text-zinc-400 mt-1">Video ID: {video.videoId.slice(0, 12)}...</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Video Player */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-space text-xl font-bold mb-4 flex items-center gap-2">
            <FaPlay className="text-cyan-400" />
            Video Preview
          </h2>
          <div className="aspect-video rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden">
            <video
              src={`http://127.0.0.1:8000${video.videoUrl}`}
              controls
              className="max-w-full max-h-full object-contain"
              onLoadedMetadata={(e) => {
                const videoEl = e.currentTarget;
                // Check if video dimensions suggest it needs rotation
                // Portrait videos (height > width) from phones are often rotated 90 degrees
                if (videoEl.videoWidth < videoEl.videoHeight) {
                  // Video is already portrait, no rotation needed
                  setVideoRotation(0);
                } else if (videoEl.videoWidth > videoEl.videoHeight * 1.5) {
                  // Very wide video might need rotation
                  // Check if it should be portrait based on aspect ratio
                  setVideoRotation(0);
                }
              }}
              style={{
                transform: `rotate(${videoRotation}deg)`,
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Platform Predictions */}
        {predictions && Object.keys(predictions).length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-space text-xl font-bold mb-6 flex items-center gap-2">
              <FaFire className="text-orange-400" />
              Real-World Performance Predictions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaEye className="text-cyan-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Views</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(predictions.predicted_views || predictions.baseline_views || 0)}
                </div>
                {predictions.predicted_views_range && (
                  <div className="text-xs text-zinc-400 mt-1">{predictions.predicted_views_range}</div>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaHeart className="text-pink-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Likes</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(predictions.predicted_likes || predictions.baseline_likes || 0)}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaShare className="text-green-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Shares</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(predictions.predicted_shares || predictions.baseline_shares || 0)}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaComment className="text-blue-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Comments</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(predictions.predicted_comments || predictions.baseline_comments || 0)}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div>
                <div className="text-sm text-zinc-500 mb-1">Engagement Rate</div>
                <div className="text-xl font-bold">
                  {((predictions.predicted_engagement_rate || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Virality Score</div>
                <div className="text-xl font-bold">{predictions.virality_score || 0}/10</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Performance Tier</div>
                <div className="text-xl font-bold">{predictions.performance_tier || "Average"}</div>
              </div>
            </div>

            {/* Insights */}
            {(predictions.content_strengths || predictions.content_weaknesses || predictions.recommendations) && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                {predictions.content_strengths && predictions.content_strengths.length > 0 && (
                  <div>
                    <div className="text-sm font-bold text-green-400 mb-2">✅ Strengths</div>
                    <ul className="space-y-1">
                      {predictions.content_strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {predictions.content_weaknesses && predictions.content_weaknesses.length > 0 && (
                  <div>
                    <div className="text-sm font-bold text-yellow-400 mb-2">⚠️ Areas for Improvement</div>
                    <ul className="space-y-1">
                      {predictions.content_weaknesses.map((weakness: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {predictions.recommendations && predictions.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm font-bold text-cyan-400 mb-2">💡 Recommendations</div>
                    <ul className="space-y-1">
                      {predictions.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Simulation Metrics */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-space text-xl font-bold mb-6 flex items-center gap-2">
            <FaUsers className="text-purple-400" />
            Persona Simulation Results
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold">{metrics.total_views || 0}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Total Views</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold">{metrics.total_likes || 0}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Likes</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold">{metrics.total_shares || 0}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Shares</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-3xl font-bold">{metrics.total_comments || 0}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Comments</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-zinc-500 mb-1">Engagement Rate</div>
              <div className="text-2xl font-bold">
                {((metrics.engagement_rate || 0) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">Personas Changed</div>
              <div className="text-2xl font-bold">{metrics.personas_who_changed || 0}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">Social Influence</div>
              <div className="text-2xl font-bold">
                {((metrics.social_influence_percentage || 0) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Video Analysis */}
        {results.video_analysis && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-space text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartLine className="text-yellow-400" />
              Content Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-zinc-500 mb-1">Category</div>
                <div className="text-lg font-semibold capitalize">
                  {results.video_analysis.content_category || "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Quality Score</div>
                <div className="text-lg font-semibold">
                  {results.video_analysis.quality_score || "N/A"}/10
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
