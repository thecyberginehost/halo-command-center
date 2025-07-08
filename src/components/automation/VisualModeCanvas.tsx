import { VisualWorkflowCanvas } from '../workflow/visual/VisualWorkflowCanvas';

interface VisualModeCanvasProps {
  onAddStepClick: () => void;
  onSaveWorkflow?: () => void;
  onWorkflowChange?: (nodes: any[], edges: any[]) => void;
}

export function VisualModeCanvas({ onAddStepClick, onSaveWorkflow, onWorkflowChange }: VisualModeCanvasProps) {
  return (
    <div className="w-full h-full">
      <VisualWorkflowCanvas 
        onSaveWorkflow={onSaveWorkflow} 
        onWorkflowChange={onWorkflowChange}
      />
    </div>
  );
}