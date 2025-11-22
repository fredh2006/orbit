'use client';

import {
  X,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Clock,
  Target,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface AnalyticsSidebarProps {
  data: {
    platform_predictions?: {
      predicted_views?: number;
      baseline_views?: number;
      predicted_likes?: number;
      baseline_likes?: number;
      predicted_comments?: number;
      baseline_comments?: number;
      predicted_shares?: number;
      baseline_shares?: number;
      predicted_engagement_rate?: number;
      virality_score?: number;
      reach_estimate?: string;
      performance_tier?: string;
      content_strengths?: string[];
      content_weaknesses?: string[];
      recommendations?: string[];
      best_time_to_post?: string;
      comparison_to_user_average?: string;
    };
    video_analysis?: {
      summary?: string;
      key_themes?: string[];
      tone?: string;
      target_audience?: string;
    };
  };
  onClose: () => void;
}

export default function AnalyticsSidebar({ data, onClose }: AnalyticsSidebarProps) {
  const predictions = data.platform_predictions;

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Get metrics
  const totalViews = predictions?.predicted_views || predictions?.baseline_views || 0;
  const totalLikes = predictions?.predicted_likes || predictions?.baseline_likes || 0;
  const totalComments = predictions?.predicted_comments || predictions?.baseline_comments || 0;
  const totalShares = predictions?.predicted_shares || predictions?.baseline_shares || 0;
  const engagementRate = predictions?.predicted_engagement_rate || 0;
  const viralityScore = predictions?.virality_score || 0;
  const reachEstimate = predictions?.reach_estimate || 'Unknown';

  return (
    <div className="fixed right-0 top-0 h-screen w-[400px] bg-black border-l border-white/10 overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-white/10 px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">Analytics</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {!predictions ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">No analytics data available</p>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Performance Metrics
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  icon={<Eye className="w-4 h-4" />}
                  label="Views"
                  value={formatNumber(totalViews)}
                />
                <MetricCard
                  icon={<Heart className="w-4 h-4" />}
                  label="Likes"
                  value={formatNumber(totalLikes)}
                />
                <MetricCard
                  icon={<MessageCircle className="w-4 h-4" />}
                  label="Comments"
                  value={formatNumber(totalComments)}
                />
                <MetricCard
                  icon={<Share2 className="w-4 h-4" />}
                  label="Shares"
                  value={formatNumber(totalShares)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <MetricCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Engagement"
                  value={`${(engagementRate * 100).toFixed(1)}%`}
                  highlight
                />
                <MetricCard
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Virality"
                  value={`${viralityScore}/10`}
                  highlight
                />
                <MetricCard
                  icon={<Eye className="w-4 h-4" />}
                  label="Reach"
                  value={reachEstimate}
                  highlight
                  small
                />
              </div>
            </div>

            {/* Performance Tier */}
            {predictions.performance_tier && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Performance Tier</span>
                  <span className="text-sm font-semibold text-white">
                    {predictions.performance_tier}
                  </span>
                </div>
              </div>
            )}

            {/* Comparison to Average */}
            {predictions.comparison_to_user_average && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-400">vs Your Average</span>
                </div>
                <p className="text-sm text-white">{predictions.comparison_to_user_average}</p>
              </div>
            )}

            {/* Strengths */}
            {predictions.content_strengths && predictions.content_strengths.length > 0 && (
              <InsightSection
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                title="Strengths"
                items={predictions.content_strengths}
                iconColor="text-emerald-400"
              />
            )}

            {/* Areas for Improvement */}
            {predictions.content_weaknesses && predictions.content_weaknesses.length > 0 && (
              <InsightSection
                icon={<AlertCircle className="w-4 h-4 text-amber-400" />}
                title="Areas for Improvement"
                items={predictions.content_weaknesses}
                iconColor="text-amber-400"
              />
            )}

            {/* Recommendations */}
            {predictions.recommendations && predictions.recommendations.length > 0 && (
              <InsightSection
                icon={<Lightbulb className="w-4 h-4 text-blue-400" />}
                title="Recommendations"
                items={predictions.recommendations}
                iconColor="text-blue-400"
              />
            )}

            {/* Best Time to Post */}
            {predictions.best_time_to_post && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-400">Best Time to Post</span>
                </div>
                <p className="text-sm text-white">{predictions.best_time_to_post}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  highlight = false,
  small = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-3 ${highlight ? 'bg-white/[0.07]' : ''}`}>
      <div className="flex items-center gap-2 mb-1.5 text-zinc-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`font-semibold text-white ${small ? 'text-xs' : 'text-lg'}`}>
        {value}
      </div>
    </div>
  );
}

// Insight Section Component
function InsightSection({
  icon,
  title,
  items,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className={`flex items-center gap-2 mb-3 ${iconColor}`}>
        {icon}
        <span className="text-xs font-medium text-white">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
            <span className="text-zinc-500 mt-0.5">•</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
