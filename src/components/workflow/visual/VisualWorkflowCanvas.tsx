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
  Connection,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { BottomNodeToolbar } from './BottomNodeToolbar';
import { NodeConfigPanel } from './NodeConfigPanel';
import { VisualWorkflowNode, VisualWorkflowEdge } from '@/types/visualWorkflow';
import { IntegrationNode } from '@/types/integrations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, Play } from 'lucide-react';

interface VisualWorkflowCanvasProps {
  initialNodes?: VisualWorkflowNode[];
  initialEdges?: VisualWorkflowEdge[];
  onWorkflowChange?: (nodes: VisualWorkflowNode[], edges: VisualWorkflowEdge[]) => void;
  onSaveWorkflow?: () => void;
  onChatToggle?: () => void;
}

// Create a proper component instead of inline function
const IntegrationNodeComponent = (props: any) => {
  const handleConfigClick = (nodeId: string) => {
    const canvasElement = document.querySelector('.react-flow-canvas');
    if (canvasElement) {
      const event = new CustomEvent('nodeConfigClick', { detail: { nodeId } });
      canvasElement.dispatchEvent(event);
    }
  };

  const handleDuplicate = (nodeId: string) => {
    const canvasElement = document.querySelector('.react-flow-canvas');
    if (canvasElement) {
      const event = new CustomEvent('nodeDuplicate', { detail: { nodeId } });
      canvasElement.dispatchEvent(event);
    }
  };

  const handleDelete = (nodeId: string) => {
    const canvasElement = document.querySelector('.react-flow-canvas');
    if (canvasElement) {
      const event = new CustomEvent('nodeDelete', { detail: { nodeId } });
      canvasElement.dispatchEvent(event);
    }
  };

  return (
    <BaseWorkflowNode 
      {...props} 
      onConfigClick={handleConfigClick}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
    />
  );
};

// Add display name for React DevTools
IntegrationNodeComponent.displayName = 'IntegrationNodeComponent';

const nodeTypes = {
  integrationNode: IntegrationNodeComponent,
};

export function VisualWorkflowCanvas({ 
  initialNodes = [], 
  initialEdges = [],
  onWorkflowChange,
  onSaveWorkflow,
  onChatToggle 
}: VisualWorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<VisualWorkflowNode>(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<VisualWorkflowEdge>(initialEdges || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const selectedNode = useMemo(() => 
    nodes.find(node => node.id === selectedNodeId), 
    [nodes, selectedNodeId]
  );

  // Removed drag and drop handlers - now using click-to-add

  const addNodeFromIntegration = useCallback((integration: IntegrationNode, position: { x: number; y: number }) => {
    console.log('addNodeFromIntegration called:', integration.name);
    console.log('Current nodes count:', nodes.length);
    
    // Calculate smart position based on existing nodes
    const calculateSmartPosition = (): { x: number; y: number } => {
      if (nodes.length === 0) {
        return { x: 100, y: 100 };
      }
      
      // Find the rightmost node
      const rightmostNode = nodes.reduce((prev, current) => 
        (prev.position.x > current.position.x) ? prev : current
      );
      
      return {
        x: rightmostNode.position.x + 200, // Add 200px spacing
        y: rightmostNode.position.y
      };
    };

    const smartPosition = position.x === 100 && position.y === 100 
      ? calculateSmartPosition() 
      : position;

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
      draggable: true,
      selectable: true,
      connectable: true,
      deletable: true,
    };

    console.log('Adding node:', newNode);
    setNodes(prev => {
      const newNodes = [...prev, newNode];
      console.log('New nodes array length:', newNodes.length);
      return newNodes;
    });
    
    // Auto-fit view after adding node
    setTimeout(() => {
      const reactFlowInstance = (window as any).reactFlowInstance;
      if (reactFlowInstance && reactFlowInstance.fitView) {
        reactFlowInstance.fitView({ padding: 0.1 });
      }
    }, 100);
    
    toast({
      title: "Node Added",
      description: `${integration.name} node added to workflow`,
    });
  }, [setNodes, toast, nodes]);

  const onConnect = useCallback((connection: Connection) => {
    const edge: VisualWorkflowEdge = {
      ...connection,
      id: `${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    };

    setEdges(prev => addEdge(edge, prev));
    
    toast({
      title: "Connection Created",
      description: "Nodes have been connected successfully",
    });
  }, [setEdges, toast]);

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
    event.stopPropagation();
    setSelectedNodeId(node.id);
  }, []);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode: VisualWorkflowNode = {
      ...nodeToDuplicate,
      id: `${nodeToDuplicate.data.integration.id}-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 120,
        y: nodeToDuplicate.position.y + 40,
      },
      data: {
        ...nodeToDuplicate.data,
        isConfigured: false, // Reset configuration status
      },
    };

    setNodes(prev => [...prev, newNode]);
    
    toast({
      title: "Node Duplicated",
      description: `${nodeToDuplicate.data.integration.name} node has been duplicated`,
    });
  }, [nodes, setNodes, toast]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(node => node.id === nodeId);
    if (!nodeToDelete) return;

    // Remove the node
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    
    // Remove connected edges
    setEdges(prev => prev.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    // Close config panel if this node is selected
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    
    toast({
      title: "Node Deleted",
      description: `${nodeToDelete.data.integration.name} node has been deleted`,
    });
  }, [nodes, setNodes, setEdges, selectedNodeId, toast]);

  const handleSaveWorkflow = useCallback(() => {
    if (!onSaveWorkflow) {
      toast({
        title: "Workflow Saved",
        description: "Your visual workflow has been saved locally."
      });
      return;
    }

    try {
      onSaveWorkflow();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save workflow.",
        variant: "destructive"
      });
    }
  }, [onSaveWorkflow, toast]);

  const handleExecuteWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Please add some nodes to execute the workflow.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { WorkflowExecutionService } = await import('@/services/workflowExecution');
      const executionService = new WorkflowExecutionService();
      
      const executionId = await executionService.executeVisualWorkflow(
        'visual-workflow-' + Date.now(),
        nodes,
        edges,
        { trigger: 'manual', timestamp: new Date().toISOString() }
      );

      toast({
        title: "Workflow Started",
        description: `Workflow execution started with ID: ${executionId}`
      });

    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast({
        title: "Execution Failed",
        description: "Failed to start workflow execution.",
        variant: "destructive"
      });
    }
  }, [nodes, edges, toast]);

  // Update nodes and edges when initial props change
  React.useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    if (initialEdges && initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  // Notify parent of workflow changes
  React.useEffect(() => {
    onWorkflowChange?.(nodes, edges);
  }, [nodes, edges, onWorkflowChange]);

  // Handle custom events from nodes
  React.useEffect(() => {
    const handleNodeConfigClick = (event: CustomEvent) => {
      setSelectedNodeId(event.detail.nodeId);
    };

    const handleNodeDuplicate = (event: CustomEvent) => {
      handleDuplicateNode(event.detail.nodeId);
    };

    const handleNodeDelete = (event: CustomEvent) => {
      handleDeleteNode(event.detail.nodeId);
    };

    const canvasElement = document.querySelector('.react-flow-canvas');
    if (canvasElement) {
      canvasElement.addEventListener('nodeConfigClick', handleNodeConfigClick as EventListener);
      canvasElement.addEventListener('nodeDuplicate', handleNodeDuplicate as EventListener);
      canvasElement.addEventListener('nodeDelete', handleNodeDelete as EventListener);

      return () => {
        canvasElement.removeEventListener('nodeConfigClick', handleNodeConfigClick as EventListener);
        canvasElement.removeEventListener('nodeDuplicate', handleNodeDuplicate as EventListener);
        canvasElement.removeEventListener('nodeDelete', handleNodeDelete as EventListener);
      };
    }
  }, [handleDuplicateNode, handleDeleteNode]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main Canvas - Ensure React Flow is visible */}
      <div className="absolute inset-0 z-10 w-full h-full" ref={reactFlowWrapper}>
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex space-x-2">
          <Button onClick={handleSaveWorkflow} size="sm" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleExecuteWorkflow} size="sm">
            Execute Workflow
          </Button>
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          className="w-full h-full bg-background react-flow-canvas"
          style={{ width: '100%', height: '100%' }}
          connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          defaultEdgeOptions={{
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
            type: 'smoothstep',
          }}
          onInit={(reactFlowInstance) => {
            // Store reference for auto-zoom functionality
            (window as any).reactFlowInstance = reactFlowInstance;
          }}
        >
          <Background />
          <Controls position="bottom-right" />
        </ReactFlow>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Start building your workflow
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the toolbar below to add nodes to your canvas
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Node Toolbar - Lower z-index to not interfere */}
      <BottomNodeToolbar onAddNode={addNodeFromIntegration} onChatToggle={onChatToggle} />

      {/* Configuration Panel - Right slide-out with higher z-index */}
      {selectedNode && (
        <div className="fixed top-0 right-0 h-full w-96 bg-background border-l shadow-xl z-50 animate-slide-in-right">
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