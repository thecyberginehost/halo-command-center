import { VisualWorkflowCanvas } from '../workflow/visual/VisualWorkflowCanvas';

interface VisualModeCanvasProps {
  onAddStepClick: () => void;
}

export function VisualModeCanvas({ onAddStepClick }: VisualModeCanvasProps) {
  return <VisualWorkflowCanvas />;
}