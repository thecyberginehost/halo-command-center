import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { NodePalette } from './NodePalette';
import { NodeConfigPanel } from './NodeConfigPanel';
import { VisualWorkflowNode, VisualWorkflowEdge } from '@/types/visualWorkflow';
import { IntegrationNode } from '@/types/integrations';
import { useToast } from '@/hooks/use-toast';

interface VisualWorkflowCanvasProps {
  initialNodes?: VisualWorkflowNode[];
  initialEdges?: VisualWorkflowEdge[];
  onWorkflowChange?: (nodes: VisualWorkflowNode[], edges: VisualWorkflowEdge[]) => void;
}

const nodeTypes = {
  integrationNode: BaseWorkflowNode,
};

export function VisualWorkflowCanvas({ 
  initialNodes = [], 
  initialEdges = [],
  onWorkflowChange 
}: VisualWorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<VisualWorkflowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<VisualWorkflowEdge>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const selectedNode = useMemo(() => 
    nodes.find(node => node.id === selectedNodeId), 
    [nodes, selectedNodeId]
  );

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (!reactFlowWrapper.current) return;

    try {
      const integrationData = event.dataTransfer.getData('application/reactflow');
      const integration: IntegrationNode = JSON.parse(integrationData);
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      addNodeFromIntegration(integration, position);
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        title: "Error",
        description: "Failed to add node to canvas",
        variant: "destructive"
      });
    }
  }, []);

  const addNodeFromIntegration = useCallback((integration: IntegrationNode, position: { x: number; y: number }) => {
    const newNode: VisualWorkflowNode = {
      id: `${integration.id}-${Date.now()}`,
      type: 'integrationNode',
      position,
      data: {
        integration,
        config: {},
        label: integration.name,
        isConfigured: false,
      },
    };

    setNodes(prev => [...prev, newNode]);
    
    toast({
      title: "Node Added",
      description: `${integration.name} node added to workflow`,
    });
  }, [setNodes, toast]);

  const onConnect = useCallback((connection: Connection) => {
    const edge: VisualWorkflowEdge = {
      ...connection,
      id: `${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: true,
    };

    setEdges(prev => addEdge(edge, prev));
  }, [setEdges]);

  const handleNodeConfigChange = useCallback((nodeId: string, config: Record<string, any>) => {
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

    toast({
      title: "Configuration Saved",
      description: "Node configuration has been updated",
    });
  }, [setNodes, toast]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Notify parent of workflow changes
  React.useEffect(() => {
    onWorkflowChange?.(nodes, edges);
  }, [nodes, edges, onWorkflowChange]);

  return (
    <div className="flex h-full">
      {/* Node Palette */}
      <div className="w-80 border-r bg-background">
        <NodePalette onAddNode={addNodeFromIntegration} />
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              const workflowNode = node as VisualWorkflowNode;
              return workflowNode.data.integration.color;
            }}
          />
        </ReactFlow>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Start building your workflow
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag nodes from the palette or click on them to add to your canvas
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      {selectedNode && (
        <div className="w-96 border-l bg-background">
          <NodeConfigPanel
            node={selectedNode}
            onConfigChange={handleNodeConfigChange}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>
      )}
    </div>
  );
}