'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { Sparkles, Users, GitBranch, Zap, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import PersonaDetailModal from '../components/PersonaDetailModal';
import AnalyticsSidebar from './AnalyticsSidebar';

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
    viral_coefficient: number;
  };
  video_analysis?: {
    summary?: string;
    key_themes?: string[];
    tone?: string;
    target_audience?: string;
  };
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
  const router = useRouter();
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [cameraDistance, setCameraDistance] = useState(3000); // Start super zoomed out
  const [analysisStatus, setAnalysisStatus] = useState<string>('Initializing...');

  // Modal state
  const [selectedPersona, setSelectedPersona] = useState<GraphNode | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);
  const [showAnalyticsSidebar, setShowAnalyticsSidebar] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const rotationRef = useRef<number>(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have a testId in URL params
    const urlTestId = searchParams.get('testId');

    // If we have a testId from URL, try to load that specific test's data
    if (urlTestId) {
      const storedTestData = localStorage.getItem(`orbit_network_${urlTestId}`);

      if (storedTestData) {
        try {
          const networkData = JSON.parse(storedTestData);
          console.log(`Loading network data for test ${urlTestId} from localStorage`);

          // Validate the data
          if (!networkData.personas || !Array.isArray(networkData.personas)) {
            throw new Error('Invalid data: personas array is missing');
          }
          if (!networkData.initial_reactions || !Array.isArray(networkData.initial_reactions)) {
            throw new Error('Invalid data: initial_reactions array is missing');
          }
          if (!networkData.interaction_events || !Array.isArray(networkData.interaction_events)) {
            throw new Error('Invalid data: interaction_events array is missing');
          }
          if (!networkData.persona_network || !networkData.persona_network.edges) {
            throw new Error('Invalid data: persona_network.edges is missing');
          }

          setTestId(urlTestId);
          setData(networkData);
          setLoading(false);
          return;
        } catch (e) {
          console.error(`Failed to load data for test ${urlTestId}:`, e);
          // Fall through to other methods
        }
      } else {
        // Try to fetch from API using the testId
        console.log(`No cached data for test ${urlTestId}, fetching from API...`);
        setAnalysisStatus('Loading network visualization...');

        fetch(`http://127.0.0.1:8000/api/v1/test/${urlTestId}/results`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load results: ${response.status}`);
            }

            const resultsData = await response.json();
            console.log('Data loaded from API:', {
              personas: resultsData.personas?.length,
              reactions: resultsData.initial_reactions?.length,
              interactions: resultsData.interaction_events?.length,
              edges: resultsData.persona_network?.edges?.length
            });
            console.log('Full API response data:', resultsData);

            // Store for future use
            const networkData = {
              ...resultsData,
              testId: urlTestId
            };
            localStorage.setItem(`orbit_network_${urlTestId}`, JSON.stringify(networkData));

            setTestId(urlTestId);
            setData(resultsData);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching test results:', err);
            setError(`Failed to load network data: ${err.message}`);
            setLoading(false);
          });
        return;
      }
    }

    // Otherwise, try to load pre-fetched data from localStorage
    const storedNetworkData = localStorage.getItem('orbit_network_data');

    if (storedNetworkData) {
      try {
        const networkData = JSON.parse(storedNetworkData);
        console.log('Loading pre-fetched network data from localStorage');

        // Validate the data
        if (!networkData.personas || !Array.isArray(networkData.personas)) {
          throw new Error('Invalid data: personas array is missing');
        }
        if (!networkData.initial_reactions || !Array.isArray(networkData.initial_reactions)) {
          throw new Error('Invalid data: initial_reactions array is missing');
        }
        if (!networkData.interaction_events || !Array.isArray(networkData.interaction_events)) {
          throw new Error('Invalid data: interaction_events array is missing');
        }
        if (!networkData.persona_network || !networkData.persona_network.edges) {
          throw new Error('Invalid data: persona_network.edges is missing');
        }

        if (networkData.test_id) {
          setTestId(networkData.test_id);
        }

        // Data is ready, load immediately
        setData(networkData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to load pre-fetched data:', e);
        // Fall through to fetch from API
      }
    }

    // Fallback: try to get test data and fetch from API
    const storedTestData = localStorage.getItem('orbit_current_test');

    let currentTestId: string | null = null;
    if (storedTestData) {
      try {
        const testData = JSON.parse(storedTestData);
        currentTestId = testData.test_id;
        setTestId(currentTestId);
      } catch (e) {
        console.error('Failed to parse stored test data:', e);
      }
    }

    // If we have a test ID, fetch the results from API
    if (currentTestId) {
      setAnalysisStatus('Loading network visualization...');

      fetch('http://127.0.0.1:8000/api/v1/test-results/latest')
        .then(async (resultsResponse) => {
          if (!resultsResponse.ok) {
            throw new Error(`Failed to load results: ${resultsResponse.status}`);
          }

          const resultsData = await resultsResponse.json();
          console.log('Data loaded from API:', {
            personas: resultsData.personas?.length,
            reactions: resultsData.initial_reactions?.length,
            interactions: resultsData.interaction_events?.length,
            edges: resultsData.persona_network?.edges?.length
          });

          if (!resultsData.personas || !Array.isArray(resultsData.personas)) {
            throw new Error('Invalid data: personas array is missing');
          }
          if (!resultsData.initial_reactions || !Array.isArray(resultsData.initial_reactions)) {
            throw new Error('Invalid data: initial_reactions array is missing');
          }
          if (!resultsData.interaction_events || !Array.isArray(resultsData.interaction_events)) {
            throw new Error('Invalid data: interaction_events array is missing');
          }
          if (!resultsData.persona_network || !resultsData.persona_network.edges) {
            throw new Error('Invalid data: persona_network.edges is missing');
          }

          setData(resultsData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading results:', err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      // No test ID, fallback to demo data
      setAnalysisStatus('Loading demo data...');

      fetch('/test-data.json')
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load data: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Demo data loaded successfully');

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

          if (data.test_id) {
            setTestId(data.test_id);
          }

          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading demo data:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Use second_reactions if available (after social influence), otherwise fall back to initial_reactions
    const reactions = data.second_reactions || data.initial_reactions;

    // Validate reactions data
    if (!reactions || !Array.isArray(reactions)) {
      console.error('Invalid reactions data:', { reactions, data });
      setError('Invalid network data: reactions missing');
      return;
    }

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
      .enableNodeDrag(true)
      .enableNavigationControls(true)
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

        // Determine status indicator
        const statusColor = hasShared ? '#fcd34d' : isEngaged ? '#ffffff' : '#71717a';
        const statusLabel = hasShared ? 'Shared' : isEngaged ? 'Engaged' : 'No engagement';

        return `
          <div style="background: rgba(0, 0, 0, 0.85); color: white; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 8px ${statusColor};"></div>
              <div style="color: #ffffff; font-weight: bold; font-size: 16px;">
                ${n.name}
              </div>
            </div>
            <div style="font-size: 13px; color: #a1a1aa; margin-bottom: 4px;">
              ${n.persona.age} • ${n.persona.occupation}
            </div>
            <div style="font-size: 11px; color: ${statusColor}; margin-bottom: 8px;">
              ${statusLabel}
            </div>
            <div style="font-size: 12px; color: #71717a; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              Click for details
            </div>
          </div>
        `;
      });

    graphRef.current = graph;

    // Set initial camera position (super zoomed out to see the whole network as a tiny cluster)
    // Start at a dramatic side angle for cinematic spiral effect
    const startAngle = Math.PI * 0.75; // 135 degrees - start from the side
    const startX = cameraDistance * Math.sin(startAngle);
    const startZ = cameraDistance * Math.cos(startAngle);
    graph.cameraPosition({ x: startX, y: 800, z: startZ }, null, 0); // High elevation for dramatic dive

    // Zoom in animation with dramatic spiral
    setTimeout(() => {
      // Spiral in from above-side to front view
      graph.cameraPosition(
        { x: -50, y: 50, z: 300 }, // Final position slightly offset for natural feel
        undefined, // Don't specify lookAt to preserve control
        3500 // 3.5 second dramatic zoom
      );
      setCameraDistance(300);
    }, 500);

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
        try {
          // Properly dispose of Three.js resources
          const scene = graphRef.current.scene();
          if (scene) {
            scene.traverse((object: any) => {
              if (object.geometry) {
                object.geometry.dispose();
              }
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material: any) => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }

          // Call the graph's destructor
          if (graphRef.current._destructor) {
            graphRef.current._destructor();
          }
        } catch (e) {
          console.warn('Error during graph cleanup:', e);
        }
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black">
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black">
        <div className="text-center max-w-md mx-4">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Failed to Load Network Data</h2>
            <p className="text-zinc-300 mb-6">{error || 'No valid network data available for this test.'}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-lg bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-zinc-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back to Dashboard Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-6 left-6 z-10 pointer-events-auto rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl px-4 py-3 flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Analytics Toggle Button */}
      <button
        onClick={() => setShowAnalyticsSidebar(!showAnalyticsSidebar)}
        className="absolute top-6 right-6 z-10 pointer-events-auto rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl px-4 py-3 flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-sm font-medium">Analytics</span>
      </button>

      {/* Stats Panel - Minimalistic */}
      {/* <div className="absolute top-6 left-6 w-56 z-10 pointer-events-auto rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        <div className="p-5">
          <h2 className="font-space text-sm font-bold text-white/90 mb-4 uppercase tracking-wider">
            Network Stats
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Stars
              </span>
              <span className="text-sm text-white font-medium">{data.personas.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5" />
                Links
              </span>
              <span className="text-sm text-white font-medium">{data.persona_network.edges.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Events
              </span>
              <span className="text-sm text-white font-medium">{data.interaction_events.length}</span>
            </div>
            {data.final_metrics && (
              <>
                <div className="h-px bg-white/5 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Engagement</span>
                  <span className="text-sm text-amber-300 font-semibold">
                    {(data.final_metrics.engagement_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div> */}

      {/* Legend - Minimalistic */}
      <div className="absolute bottom-6 left-6 w-56 z-10 pointer-events-auto rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        <div className="p-5">
          <h3 className="font-space text-sm font-bold text-white/90 mb-4 uppercase tracking-wider">
            Legend
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-white shadow-lg shadow-white/30 flex-shrink-0"></div>
              <span className="text-zinc-400">Shared</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0"></div>
              <span className="text-zinc-400">Engaged</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0"></div>
              <span className="text-zinc-400">Passive</span>
            </div>
            <div className="h-px bg-white/5 my-2" />
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-px bg-blue-300/20 flex-shrink-0"></div>
              <span className="text-zinc-400">Connection</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-px bg-amber-400/60 flex-shrink-0"></div>
              <span className="text-zinc-400">Interaction</span>
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

      {/* Analytics Sidebar */}
      {showAnalyticsSidebar && (
        <AnalyticsSidebar
          data={data}
          onClose={() => setShowAnalyticsSidebar(false)}
        />
      )}
    </>
  );
}
