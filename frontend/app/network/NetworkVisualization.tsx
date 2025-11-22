'use client';

import { useEffect, useState, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { Sparkles, Users, GitBranch, Zap, TrendingUp } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import PersonaDetailModal from '../components/PersonaDetailModal';

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
  test_id?: string;
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

  // Modal state
  const [selectedPersona, setSelectedPersona] = useState<GraphNode | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);

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

        // Extract test_id if available
        if (data.test_id) {
          setTestId(data.test_id);
          console.log('Test ID extracted:', data.test_id);
        } else {
          console.warn('No test_id found in data - chat functionality may be limited');
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

    // Build nodes - all white, differentiated by size and brightness like real constellations
    const nodes: GraphNode[] = data.personas.map((persona, index) => {
      const reaction = reactionsMap.get(persona.persona_id);
      let color = '#666666'; // dim gray - no engagement
      let val = 2; // very small - no engagement

      if (reaction) {
        // Check for 'shared' or 'will_share' field (different formats)
        const shared = reaction.shared || (reaction as any).will_share;
        const engaged = reaction.engaged || (reaction as any).will_like || (reaction as any).will_comment;

        if (shared) {
          color = '#ffffff'; // brightest white
          val = 20; // very large - shared (brightest star)
        } else if (engaged) {
          color = '#e0e0e0'; // bright white
          val = 10; // medium-large - engaged
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

    // Build links - constellation lines (thin, ethereal)
    const links: GraphLink[] = data.persona_network.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      color: 'rgba(139, 168, 208, 0.15)', // faint blue-ish constellation lines
      width: 0.5,
      isInteraction: false
    }));

    // Add interaction links - glowing constellation connections
    data.interaction_events.forEach(event => {
      links.push({
        source: event.source_persona_id,
        target: event.target_persona_id,
        color: 'rgba(255, 223, 128, 0.6)', // warm golden glow
        width: 1.5,
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

    // Create the graph with night sky theme
    const graph = (ForceGraph3D as any)()(containerRef.current)
      .graphData(graphData)
      .nodeLabel('name')
      .nodeColor('color')
      .nodeVal('val')
      .linkColor('color')
      .linkWidth('width')
      .linkOpacity(0.4)
      .backgroundColor('#000814') // deep night sky blue-black
      .showNavInfo(false)
      .onNodeHover((node: any) => {
        setHoveredNode(node as GraphNode | null);
        if (containerRef.current) {
          containerRef.current.style.cursor = node ? 'pointer' : 'default';
        }
      })
      .onNodeClick((node: any) => {
        const graphNode = node as GraphNode;
        if (graphNode && graphNode.name) {
          console.log('Node clicked:', graphNode.name);
          setSelectedPersona(graphNode);
          setIsDetailModalOpen(true);
        }
      })
      .nodeLabel((node: any) => {
        const n = node as GraphNode;
        // Don't show tooltip for background stars
        if (!n.name) return '';

        // Simple tooltip with just key info
        const isEngaged = n.reaction?.engaged || (n.reaction as any)?.will_like || (n.reaction as any)?.will_comment || (n.reaction as any)?.will_share;
        const hasShared = n.reaction?.shared || (n.reaction as any)?.will_share;

        return `
          <div style="background: rgba(0, 0, 0, 0.85); color: white; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); min-width: 200px;">
            <div style="color: ${hasShared ? '#fcd34d' : '#ffffff'}; font-weight: bold; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>${hasShared ? '⭐' : isEngaged ? '✨' : '◦'}</span>
              ${n.name}
            </div>
            <div style="font-size: 13px; color: #a1a1aa; margin-bottom: 8px;">
              ${n.persona.age} • ${n.persona.occupation}
            </div>
            <div style="font-size: 12px; color: #71717a; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              Click for details
            </div>
          </div>
        `;
      });

    graphRef.current = graph;

    // Add background stars as Three.js particles
    setTimeout(() => {
      const scene = graph.scene();
      if (scene) {
        // Create star field geometry
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
          // Random position in a large sphere
          const radius = 800 + Math.random() * 400;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;

          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi);
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create star material (small white points)
        const starMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 2,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
      }
    }, 100);

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
      {/* Stats Panel - Landing Page Theme */}
      <div className="absolute top-5 left-5 max-w-xs z-10 pointer-events-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="font-space text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            Constellation Map
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center rounded-lg bg-white/5 p-3 border border-white/5">
              <span className="text-sm text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Total Stars
              </span>
              <span className="text-white font-semibold">{data.personas.length}</span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-white/5 p-3 border border-white/5">
              <span className="text-sm text-zinc-300 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-400" />
                Connections
              </span>
              <span className="text-white font-semibold">{data.persona_network.edges.length}</span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-white/5 p-3 border border-white/5">
              <span className="text-sm text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Interactions
              </span>
              <span className="text-white font-semibold">{data.interaction_events.length}</span>
            </div>
            {data.final_metrics && (
              <div className="flex justify-between items-center rounded-lg bg-white/5 p-3 border border-white/5">
                <span className="text-sm text-zinc-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Engagement
                </span>
                <span className="text-amber-300 font-bold">
                  {(data.final_metrics.engagement_rate * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-4 pt-4 border-t border-white/5">
            Hover over stars to explore. Drag to rotate, scroll to zoom.
          </p>
        </div>
      </div>

      {/* Legend - Landing Page Theme */}
      <div className="absolute bottom-5 left-5 z-10 pointer-events-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="p-5">
          <h3 className="font-space text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Star Guide
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white shadow-xl shadow-white/50"></div>
              <span className="text-zinc-300">Brightest Star (Shared)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-300 shadow-lg shadow-gray-300/30"></div>
              <span className="text-zinc-300">Bright Star (Engaged)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <span className="text-zinc-300">Dim Star (No engagement)</span>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <div className="w-8 h-px bg-blue-300/20"></div>
              <span className="text-zinc-300">Constellation Line</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-0.5 bg-amber-400/60"></div>
              <span className="text-zinc-300">Active Connection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Persona Detail Modal */}
      {isDetailModalOpen && selectedPersona && (
        <PersonaDetailModal
          persona={selectedPersona.persona}
          reaction={selectedPersona.reaction}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPersona(null);
          }}
          onStartChat={() => {
            if (testId) {
              setIsDetailModalOpen(false);
              setIsChatOpen(true);
            } else {
              // Show test ID missing warning
              setIsDetailModalOpen(false);
              alert('No test ID found in the data. Chat functionality requires a valid test ID to work properly.');
            }
          }}
        />
      )}

      {/* Chat Modal */}
      {isChatOpen && selectedPersona && testId && (
        <ChatModal
          testId={testId}
          personaId={selectedPersona.id}
          personaName={selectedPersona.name}
          personaAge={selectedPersona.persona.age}
          personaOccupation={selectedPersona.persona.occupation}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedPersona(null);
          }}
        />
      )}
    </>
  );
}
