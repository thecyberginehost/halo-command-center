import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, GripVertical } from 'lucide-react';
import { WorkflowStep } from '@/types/workflow';
import { stepIcons, stepColors } from './WorkflowStepConfig';

interface SortableWorkflowStepProps {
  step: WorkflowStep;
  index: number;
}

export const SortableWorkflowStep = ({ step, index }: SortableWorkflowStepProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = stepIcons[step.type];
  const colorClass = stepColors[step.type];
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 ${
        isDragging ? 'shadow-lg opacity-75' : 'hover:shadow-md'
      } transition-shadow cursor-grab active:cursor-grabbing`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="flex items-center cursor-grab hover:bg-gray-50 p-1 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className={`p-2 rounded-full ${colorClass}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-halo-text">{step.title}</h4>
        <p className="text-sm text-halo-textSecondary">{step.description}</p>
        <Badge variant="outline" className="mt-1 text-xs">
          {step.type}
        </Badge>
      </div>
      <Button variant="ghost" size="sm">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};