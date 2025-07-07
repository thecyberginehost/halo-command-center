import { VisualWorkflowCanvas } from '../workflow/visual/VisualWorkflowCanvas';

interface VisualModeCanvasProps {
  onAddStepClick: () => void;
  onSaveWorkflow?: () => void;
}

export function VisualModeCanvas({ onAddStepClick, onSaveWorkflow }: VisualModeCanvasProps) {
  return <VisualWorkflowCanvas onSaveWorkflow={onSaveWorkflow} />;
}