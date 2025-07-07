import { Plus } from 'lucide-react';

interface VisualModeCanvasProps {
  onAddStepClick: () => void;
}

export function VisualModeCanvas({ onAddStepClick }: VisualModeCanvasProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div 
          className="relative inline-block cursor-pointer group"
          onClick={onAddStepClick}
        >
          <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
            <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground">
            Add first step...
          </p>
        </div>
      </div>
    </div>
  );
}