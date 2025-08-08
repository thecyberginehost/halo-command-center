import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VisualWorkflowNode, VisualWorkflowEdge } from '@/types/visualWorkflow';
import { IntegrationNode } from '@/types/integrations';
import { NodeRegistryEntry } from '@/types/haloNode';
import { FlowCard } from './FlowCard';
import { ConnectionRenderer } from './ConnectionRenderer';
import { AddNodePalette } from '../../AddNodePalette';
import { ConfigurationPanel } from './ConfigurationPanel';
import { VoiceController } from './VoiceController';
import { Button } from '@/components/ui/button';
import { Save, Play, Sparkles, Grid3X3, Eye } from 'lucide-react';
import nodeRegistry from '@/nodeRegistry';

interface FlowDeckCanvasProps {
  initialNodes?: VisualWorkflowNode[];
  initialEdges?: VisualWorkflowEdge[];
  onWorkflowChange?: (nodes: VisualWorkflowNode[], edges: VisualWorkflowEdge[]) => void;
  onSaveWorkflow?: () => void;
  onChatToggle?: () => void;
}

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

interface DragState {
  isDragging: boolean;
  nodeId?: string;
  startPos: { x: number; y: number };
  offset: { x: number; y: number };
}

interface ConnectionState {
  isConnecting: boolean;
  sourceNodeId?: string;
  sourceHandle?: string;
  currentPos: { x: number; y: number };
}

export function FlowDeckCanvas({
  initialNodes = [],
  initialEdges = [],
  onWorkflowChange,
  onSaveWorkflow,
  onChatToggle
}: FlowDeckCanvasProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Core State
  const [nodes, setNodes] = useState<VisualWorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<VisualWorkflowEdge[]>(initialEdges);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  
  // Interaction State
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, startPos: { x: 0, y: 0 }, offset: { x: 0, y: 0 } });
  const [connectionState, setConnectionState] = useState<ConnectionState>({ isConnecting: false, currentPos: { x: 0, y: 0 } });
  const [showGrid, setShowGrid] = useState(true);
  const [canvasTheme, setCanvasTheme] = useState<'blueprint' | 'circuit' | 'organic'>('blueprint');
  
  // Configuration Panel
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);

  // Computed Values
  const selectedNode = useMemo(() => 
    configNodeId ? nodes.find(node => node.id === configNodeId) : null,
    [nodes, configNodeId]
  );

  const canvasTransform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  // Canvas Event Handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      setSelectedNodeIds(new Set());
      setConfigNodeId(null);
    }
  }, []);

  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * zoomFactor));
    
    // Zoom towards mouse position
    const zoomPoint = {
      x: (mouseX - viewport.x) / viewport.zoom,
      y: (mouseY - viewport.y) / viewport.zoom
    };
    
    setViewport(prev => ({
      x: mouseX - zoomPoint.x * newZoom,
      y: mouseY - zoomPoint.y * newZoom,
      zoom: newZoom
    }));
  }, [viewport]);

  // Smart positioning utility
  const getSmartNodePosition = useCallback(() => {
    if (nodes.length === 0) {
      // First node - place in center-left of visible area
      return { x: 100, y: 200 };
    }
    
    // Find the rightmost node
    const rightmostNode = nodes.reduce((rightmost, node) => 
      node.position.x > rightmost.position.x ? node : rightmost
    );
    
    const nodeWidth = 160; // FlowCard width
    const nodeHeight = 80; // FlowCard height
    const horizontalSpacing = 200; // Space between nodes horizontally
    const verticalSpacing = 120; // Space between rows
    const maxNodesPerRow = 4; // Max nodes before wrapping
    
    // Calculate new position
    const currentRowNodeCount = nodes.filter(node => 
      Math.abs(node.position.y - rightmostNode.position.y) < verticalSpacing / 2
    ).length;
    
    if (currentRowNodeCount < maxNodesPerRow) {
      // Add to current row
      return {
        x: rightmostNode.position.x + horizontalSpacing,
        y: rightmostNode.position.y
      };
    } else {
      // Start new row
      return {
        x: 100, // Reset to left
        y: rightmostNode.position.y + verticalSpacing
      };
    }
  }, [nodes]);

  // Node Operations
  const addNode = useCallback((integration: IntegrationNode, position: { x: number; y: number }) => {
    const smartPosition = getSmartNodePosition();
    
    const newNode: VisualWorkflowNode = {
      id: `${integration.id}-${Date.now()}`,
      type: 'integrationNode',
      position: smartPosition,
      data: {
        integration,
        config: {},
        label: integration.name,
        isConfigured: false,
      },
    };

    setNodes(prev => [...prev, newNode]);
    
    // Add magnetic snap animation
    setTimeout(() => {
      const snapPosition = {
        x: Math.round(newNode.position.x / 20) * 20,
        y: Math.round(newNode.position.y / 20) * 20
      };
      
      setNodes(prev => prev.map(node => 
        node.id === newNode.id 
          ? { ...node, position: snapPosition }
          : node
      ));
    }, 300);

    toast({
      title: "Card Added",
      description: `${integration.name} card added to your workflow deck`,
    });
  }, [getSmartNodePosition, toast]);

  const addHaloNode = useCallback((haloNode: NodeRegistryEntry) => {
    const smartPosition = getSmartNodePosition();
    
    const newNode: VisualWorkflowNode = {
      id: `${haloNode.name}-${Date.now()}`,
      type: 'haloNode',
      position: smartPosition,
      data: {
        haloNode,
        config: {},
        label: haloNode.displayName,
        isConfigured: false,
      },
    };

    setNodes(prev => [...prev, newNode]);
    
    // Add magnetic snap animation
    setTimeout(() => {
      const snapPosition = {
        x: Math.round(newNode.position.x / 20) * 20,
        y: Math.round(newNode.position.y / 20) * 20
      };
      
      setNodes(prev => prev.map(node => 
        node.id === newNode.id 
          ? { ...node, position: snapPosition }
          : node
      ));
    }, 300);

    toast({
      title: "Node Added",
      description: `${haloNode.displayName} node added to your workflow`,
    });
  }, [getSmartNodePosition, toast]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position }
        : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      return newSet;
    });
    if (configNodeId === nodeId) {
      setConfigNodeId(null);
    }
  }, [configNodeId]);

  const duplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const baseId = nodeToDuplicate.data.integration?.id || nodeToDuplicate.data.haloNode?.name || 'node';
    const newNode: VisualWorkflowNode = {
      ...nodeToDuplicate,
      id: `${baseId}-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 120,
        y: nodeToDuplicate.position.y + 40,
      },
      data: {
        ...nodeToDuplicate.data,
        isConfigured: false,
      },
    };

    setNodes(prev => [...prev, newNode]);
  }, [nodes]);

  // Connection Operations
  const startConnection = useCallback((nodeId: string, handle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setConnectionState({
      isConnecting: true,
      sourceNodeId: nodeId,
      sourceHandle: handle,
      currentPos: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    });
  }, []);

  const updateConnection = useCallback((event: React.MouseEvent) => {
    if (!connectionState.isConnecting) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setConnectionState(prev => ({
      ...prev,
      currentPos: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }));
  }, [connectionState.isConnecting]);

  const completeConnection = useCallback((targetNodeId: string, targetHandle: string) => {
    if (!connectionState.isConnecting || !connectionState.sourceNodeId) return;

    const newEdge: VisualWorkflowEdge = {
      id: `${connectionState.sourceNodeId}-${targetNodeId}`,
      source: connectionState.sourceNodeId,
      target: targetNodeId,
      sourceHandle: connectionState.sourceHandle,
      targetHandle: targetHandle,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
    };

    setEdges(prev => [...prev, newEdge]);
    setConnectionState({ isConnecting: false, currentPos: { x: 0, y: 0 } });

    toast({
      title: "Connection Created",
      description: "Cards have been linked in your workflow",
    });
  }, [connectionState, toast]);

  // Configuration
  const handleNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? {
            ...node,
            data: {
              ...node.data,
              config,
              isConfigured: Object.keys(config).length > 0,
              hasError: false,
              errorMessage: undefined,
            }
          }
        : node
    ));
  }, []);

  const handleSaveWorkflow = useCallback(() => {
    if (onSaveWorkflow) {
      onSaveWorkflow();
    } else {
      toast({
        title: "Workflow Saved",
        description: "Your Flow Deck has been saved successfully",
      });
    }
  }, [onSaveWorkflow, toast]);

  const handleExecuteWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: "Empty Deck",
        description: "Add some cards to execute your workflow",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Workflow Executing",
      description: "Your Flow Deck is running...",
    });
  }, [nodes, toast]);

  // Auto-arrange cards with physics-based positioning
  const autoArrange = useCallback(() => {
    const arrangedNodes = [...nodes];
    
    // Simple auto-layout algorithm
    arrangedNodes.forEach((node, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      node.position = {
        x: col * 200 + 100,
        y: row * 150 + 100
      };
    });

    setNodes(arrangedNodes);
    
    toast({
      title: "Cards Arranged",
      description: "Your workflow cards have been automatically organized",
    });
  }, [nodes, toast]);

  // Effects
  useEffect(() => {
    onWorkflowChange?.(nodes, edges);
  }, [nodes, edges, onWorkflowChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNodeIds.size > 0) {
        selectedNodeIds.forEach(nodeId => deleteNode(nodeId));
      }
      if (e.key === 'Escape') {
        setConnectionState({ isConnecting: false, currentPos: { x: 0, y: 0 } });
        setSelectedNodeIds(new Set());
        setConfigNodeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, deleteNode]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Deep Space Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 160px 30px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px'
        }} />
      </div>
      
      {/* Nebula Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <Button 
          onClick={() => setShowGrid(!showGrid)} 
          size="sm" 
          variant="outline"
          className="backdrop-blur-md bg-background/80"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button 
          onClick={autoArrange} 
          size="sm" 
          variant="outline"
          className="backdrop-blur-md bg-background/80"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Arrange
        </Button>
        <Button 
          onClick={handleSaveWorkflow} 
          size="sm" 
          variant="outline"
          className="backdrop-blur-md bg-background/80"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button 
          onClick={handleExecuteWorkflow} 
          size="sm"
          className="backdrop-blur-md bg-primary/90 hover:bg-primary"
        >
          <Play className="h-4 w-4 mr-2" />
          Execute
        </Button>
      </div>

      {/* Voice Controller */}
      <div className="absolute top-4 left-4 z-20">
        <VoiceController 
          onModeToggle={() => console.log('Voice mode toggle')}
          onCanvasCommand={(command) => {
            if (command === 'arrange') autoArrange();
            if (command === 'save') handleSaveWorkflow();
          }}
        />
      </div>

      {/* Main Canvas */}
      <div 
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ 
          marginLeft: '320px',
          backgroundImage: showGrid ? `
            radial-gradient(circle at 1px 1px, rgba(var(--foreground), 0.15) 1px, transparent 0),
            radial-gradient(circle at 20px 20px, rgba(var(--primary), 0.1) 1px, transparent 0)
          ` : undefined,
          backgroundSize: showGrid ? '20px 20px, 40px 40px' : undefined,
        }}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleCanvasWheel}
        onMouseMove={updateConnection}
      >
        {/* Background Grid Pattern */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(var(--border), 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(var(--border), 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              transform: canvasTransform,
            }}
          />
        )}

        {/* SVG for Connections */}
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: canvasTransform }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <ConnectionRenderer 
            edges={edges}
            nodes={nodes}
            connectionState={connectionState}
            onAddNodeBetween={(edgeId, position) => {
              const edge = edges.find(e => e.id === edgeId);
              if (!edge) return;

              const conditionNodeDef = nodeRegistry.find(n => n.name === 'condition') || nodeRegistry[0];
              if (!conditionNodeDef) return;

              const newNodeId = `${conditionNodeDef.name}-${Date.now()}`;
              const newNode: VisualWorkflowNode = {
                id: newNodeId,
                type: 'haloNode',
                position: { x: position.x - 80, y: position.y - 40 },
                data: {
                  haloNode: conditionNodeDef,
                  config: {},
                  label: conditionNodeDef.displayName,
                  isConfigured: false,
                },
              };

              setNodes(prev => [...prev, newNode]);

              setEdges(prev => {
                const remaining = prev.filter(e => e.id !== edgeId);
                const edgeToNew: VisualWorkflowEdge = {
                  id: `${edge.source}-${newNodeId}`,
                  source: edge.source,
                  target: newNodeId,
                  sourceHandle: edge.sourceHandle,
                  targetHandle: 'input',
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
                };
                const newToTarget: VisualWorkflowEdge = {
                  id: `${newNodeId}-${edge.target}`,
                  source: newNodeId,
                  target: edge.target,
                  sourceHandle: 'output',
                  targetHandle: edge.targetHandle,
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
                };
                return [...remaining, edgeToNew, newToTarget];
              });

              toast({
                title: 'Route added',
                description: `${conditionNodeDef.displayName} inserted between nodes`,
              });
            }}
          />
        </svg>

        {/* Workflow Cards */}
        <div 
          className="absolute inset-0"
          style={{ transform: canvasTransform }}
        >
          {nodes.map(node => (
            <FlowCard
              key={node.id}
              node={node}
              isSelected={selectedNodeIds.has(node.id)}
              onSelect={(nodeId) => {
                const newSelection = new Set([nodeId]);
                setSelectedNodeIds(newSelection);
              }}
              onConfigClick={(nodeId) => setConfigNodeId(nodeId)}
              onPositionChange={updateNodePosition}
              onConnectionStart={startConnection}
              onConnectionEnd={completeConnection}
              onDuplicate={duplicateNode}
              onDelete={deleteNode}
              theme={canvasTheme}
              zoomLevel={viewport.zoom}
            />
          ))}
        </div>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <Sparkles className="h-16 w-16 mx-auto text-primary/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome to your Flow Deck
              </h3>
              <p className="text-muted-foreground">
                Start building your automation by adding cards from the sidebar. 
                Click and drag between the connection ports on cards to link them together.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Node Palette - Left Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 z-10 bg-background/95 backdrop-blur-lg border-r border-border/50">
        <AddNodePalette
          onSelect={addHaloNode}
          onAIAssistantClick={onChatToggle}
          className="h-full"
        />
      </div>


      {/* Configuration Panel */}
      {selectedNode && (
        <ConfigurationPanel
          node={selectedNode}
          onConfigChange={handleNodeConfig}
          onClose={() => setConfigNodeId(null)}
        />
      )}
    </div>
  );
}