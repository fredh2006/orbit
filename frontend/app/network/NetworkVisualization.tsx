'use client';

import { useEffect, useState, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';

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
  engaged: boolean;
  liked?: boolean;
  commented?: boolean;
  shared?: boolean;
  action?: string;
  reason?: string;
}

interface InteractionEvent {
  event_id: string;
  timestamp: number;
  source_persona_id: string;
  target_persona_id: string;
  interaction_type: string;
  content: string;
  influence_strength: number;
  target_response: string;
}

interface NetworkEdge {
  source: string;
  target: string;
  strength?: number;
}

interface NetworkData {
  personas: Persona[];
  initial_reactions: Reaction[];
  second_reactions?: Reaction[];
  interaction_events: InteractionEvent[];
  persona_network: {
    nodes: string[];
    edges: NetworkEdge[];
  };
  final_metrics?: {
    engagement_rate: number;
    total_views: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  };
}

interface GraphNode {
  id: string;
  name: string;
  persona: Persona;
  reaction?: Reaction;
  color: string;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
  isInteraction?: boolean;
  event?: InteractionEvent;
}

export default function NetworkVisualization() {
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    console.log('Loading test data from /test-data.json');
    fetch('/test-data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load test-data.json: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Data loaded successfully:', {
          personas: data.personas?.length,
          reactions: data.initial_reactions?.length,
          interactions: data.interaction_events?.length,
          edges: data.persona_network?.edges?.length
        });

        if (!data.personas || !Array.isArray(data.personas)) {
          throw new Error('Invalid data: personas array is missing');
        }
        if (!data.initial_reactions || !Array.isArray(data.initial_reactions)) {
          throw new Error('Invalid data: initial_reactions array is missing');
        }
        if (!data.interaction_events || !Array.isArray(data.interaction_events)) {
          throw new Error('Invalid data: interaction_events array is missing');
        }
        if (!data.persona_network || !data.persona_network.edges) {
          throw new Error('Invalid data: persona_network.edges is missing');
        }

        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Use second_reactions if available (after social influence), otherwise fall back to initial_reactions
    const reactions = data.second_reactions || data.initial_reactions;
    const reactionsMap = new Map(reactions.map(r => [r.persona_id, r]));

    // Build nodes
    const nodes: GraphNode[] = data.personas.map((persona, index) => {
      const reaction = reactionsMap.get(persona.persona_id);
      let color = '#94a3b8'; // gray - no engagement
      let val = 8;

      if (reaction) {
        // Check for 'shared' or 'will_share' field (different formats)
        const shared = reaction.shared || (reaction as any).will_share;
        const engaged = reaction.engaged || (reaction as any).will_like || (reaction as any).will_comment;

        if (shared) {
          color = '#fbbf24'; // gold - shared
          val = 12;
        } else if (engaged) {
          color = '#4ade80'; // green - engaged
          val = 10;
        }
      }

      const nodeData = {
        id: persona.persona_id,
        name: persona.name,
        persona,
        reaction,
        color,
        val
      };

      // Log first 3 nodes to see the data structure
      if (index < 3) {
        const shared = reaction?.shared || (reaction as any)?.will_share;
        const engaged = reaction?.engaged || (reaction as any)?.will_like || (reaction as any)?.will_comment;

        console.log(`Node ${index + 1} data:`, {
          id: nodeData.id,
          name: nodeData.name,
          color: nodeData.color,
          val: nodeData.val,
          persona: {
            name: persona.name,
            age: persona.age,
            gender: persona.gender,
            location: persona.location,
            occupation: persona.occupation,
            interests: persona.interests
          },
          reaction: reaction ? {
            will_view: (reaction as any).will_view,
            will_like: (reaction as any).will_like,
            will_share: (reaction as any).will_share,
            will_comment: (reaction as any).will_comment,
            engaged: engaged,
            shared: shared,
            changed_from_initial: (reaction as any).changed_from_initial,
            influence_level: (reaction as any).influence_level
          } : null
        });
      }

      return nodeData;
    });

    console.log('Total nodes created:', nodes.length);

    // Build links - network connections
    const links: GraphLink[] = data.persona_network.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      color: 'rgba(255, 255, 255, 0.2)',
      width: 1,
      isInteraction: false
    }));

    // Add interaction links
    data.interaction_events.forEach(event => {
      links.push({
        source: event.source_persona_id,
        target: event.target_persona_id,
        color: 'rgba(255, 215, 0, 0.8)',
        width: 3,
        isInteraction: true,
        event
      });
    });

    console.log('Total links created:', links.length);
    console.log('Interaction events:', data.interaction_events.length);

    const graphData = { nodes, links };
    console.log('Graph data ready:', {
      nodes: graphData.nodes.length,
      links: graphData.links.length
    });

    // Create the graph
    const graph = ForceGraph3D()(containerRef.current)
      .graphData(graphData)
      .nodeLabel('name')
      .nodeColor('color')
      .nodeVal('val')
      .linkColor('color')
      .linkWidth('width')
      .linkOpacity(0.6)
      .backgroundColor('#0a0a1a')
      .onNodeHover(node => {
        setHoveredNode(node as GraphNode | null);
        if (containerRef.current) {
          containerRef.current.style.cursor = node ? 'pointer' : 'default';
        }
      })
      .nodeLabel(node => {
        const n = node as GraphNode;
        return `
          <div style="background: rgba(0,0,0,0.9); color: white; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); max-width: 300px;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">
              ${n.name}
            </div>
            <div style="font-size: 12px; margin: 4px 0;">
              <span style="color: #aaa;">Age:</span> ${n.persona.age}, ${n.persona.gender}
            </div>
            <div style="font-size: 12px; margin: 4px 0;">
              <span style="color: #aaa;">Location:</span> ${n.persona.location}
            </div>
            <div style="font-size: 12px; margin: 4px 0;">
              <span style="color: #aaa;">Occupation:</span> ${n.persona.occupation}
            </div>
            <div style="font-size: 12px; margin: 4px 0;">
              <span style="color: #aaa;">Interests:</span> ${n.persona.interests.join(', ')}
            </div>
            ${n.reaction ? `
              <div style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 8px; padding-top: 8px;">
                <div style="font-size: 12px; margin: 4px 0;">
                  <span style="color: #aaa;">Engaged:</span> ${n.reaction.engaged || (n.reaction as any).will_like || (n.reaction as any).will_comment || (n.reaction as any).will_share ? 'Yes' : 'No'}
                </div>
                ${n.reaction.engaged || (n.reaction as any).will_like || (n.reaction as any).will_comment || (n.reaction as any).will_share ? `
                  ${n.reaction.liked || (n.reaction as any).will_like ? '<div style="font-size: 12px;">✓ Liked</div>' : ''}
                  ${n.reaction.commented || (n.reaction as any).will_comment ? '<div style="font-size: 12px;">✓ Commented</div>' : ''}
                  ${n.reaction.shared || (n.reaction as any).will_share ? '<div style="font-size: 12px;">✓ Shared</div>' : ''}
                  ${n.reaction.reason || (n.reaction as any).reasoning ? `<div style="font-size: 11px; margin-top: 6px; font-style: italic; color: #ccc;">"${n.reaction.reason || (n.reaction as any).reasoning}"</div>` : ''}
                ` : ''}
              </div>
            ` : ''}
          </div>
        `;
      });

    graphRef.current = graph;

    // Clean up
    return () => {
      if (graphRef.current) {
        graphRef.current._destructor();
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-white text-2xl">Loading network data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-red-400 text-xl">Error loading data: {error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Panel */}
      <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-white/20 max-w-xs z-10 pointer-events-auto">
        <h2 className="text-yellow-400 font-bold text-xl mb-3">Network Overview</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Total Personas:</span>
            <span className="text-white font-semibold">{data.personas.length}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Connections:</span>
            <span className="text-white font-semibold">{data.persona_network.edges.length}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-300">Interactions:</span>
            <span className="text-white font-semibold">{data.interaction_events.length}</span>
          </div>
          {data.final_metrics && (
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-300">Engagement:</span>
              <span className="text-white font-semibold">
                {(data.final_metrics.engagement_rate * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Hover over nodes to see details. Drag to rotate, scroll to zoom.
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20 z-10 pointer-events-auto">
        <h3 className="text-yellow-400 font-bold text-sm mb-3">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#4ade80] border-2 border-white"></div>
            <span className="text-white">Engaged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#fbbf24] border-2 border-white"></div>
            <span className="text-white">Shared</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#94a3b8] border-2 border-white"></div>
            <span className="text-white">No engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white/30"></div>
            <span className="text-white">Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#ffd700]"></div>
            <span className="text-white">Interaction</span>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}
