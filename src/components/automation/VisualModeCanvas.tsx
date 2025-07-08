import { VisualWorkflowCanvas } from '../workflow/visual/VisualWorkflowCanvas';

interface VisualModeCanvasProps {
  onAddStepClick: () => void;
  onSaveWorkflow?: () => void;
  onWorkflowChange?: (nodes: any[], edges: any[]) => void;
  initialNodes?: any[];
  initialEdges?: any[];
}

export function VisualModeCanvas({ onAddStepClick, onSaveWorkflow, onWorkflowChange, initialNodes, initialEdges }: VisualModeCanvasProps) {
  return (
    <div className="w-full h-full">
      <VisualWorkflowCanvas 
        onSaveWorkflow={onSaveWorkflow} 
        onWorkflowChange={onWorkflowChange}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    </div>
  );
}