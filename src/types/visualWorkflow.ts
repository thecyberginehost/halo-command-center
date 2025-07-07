import { Node, Edge } from '@xyflow/react';
import { IntegrationNode } from './integrations';

export interface VisualWorkflowNode extends Node {
  data: {
    integration: IntegrationNode;
    config: Record<string, any>;
    label: string;
    isConfigured: boolean;
    hasError?: boolean;
    errorMessage?: string;
  };
  type: 'integrationNode' | 'conditionNode' | 'startNode';
}

export interface VisualWorkflowEdge extends Edge {
  data?: {
    condition?: string;
    label?: string;
  };
}

export interface VisualWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: VisualWorkflowNode[];
  edges: VisualWorkflowEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface NodeConfigPanelProps {
  node: VisualWorkflowNode;
  onConfigChange: (nodeId: string, config: Record<string, any>) => void;
  onClose: () => void;
}

export interface NodePaletteProps {
  integrations: IntegrationNode[];
  onAddNode: (integration: IntegrationNode, position: { x: number; y: number }) => void;
}