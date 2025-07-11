import { FlowDeckCanvas } from '../workflow/visual/FlowDeckCanvas';

interface VisualModeCanvasProps {
  onAddStepClick: () => void;
  onSaveWorkflow?: () => void;
  onWorkflowChange?: (nodes: any[], edges: any[]) => void;
  initialNodes?: any[];
  initialEdges?: any[];
  onChatToggle?: () => void;
}

export function VisualModeCanvas({ onAddStepClick, onSaveWorkflow, onWorkflowChange, initialNodes, initialEdges, onChatToggle }: VisualModeCanvasProps) {
  return (
    <div className="w-full h-full">
      <FlowDeckCanvas 
        onSaveWorkflow={onSaveWorkflow} 
        onWorkflowChange={onWorkflowChange}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onChatToggle={onChatToggle}
      />
    </div>
  );
}