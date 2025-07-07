import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Play, Wand2 } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, KeyboardSensor, useSensors, useSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Workflow } from '@/types/workflow';
import { SortableWorkflowStep } from './SortableWorkflowStep';
import { DeveloperModeEditor } from './DeveloperModeEditor';

interface WorkflowPreviewPanelProps {
  workflow: Workflow | null;
  isDeveloperMode: boolean;
  customCode: string;
  setCustomCode: (code: string) => void;
  onSaveWorkflow: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export const WorkflowPreviewPanel = ({
  workflow,
  isDeveloperMode,
  customCode,
  setCustomCode,
  onSaveWorkflow,
  onDragEnd
}: WorkflowPreviewPanelProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!workflow) {
    return (
      <div className="flex-1 p-6">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Wand2 className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-halo-text">
                {isDeveloperMode ? 'No Custom Code' : 'No Workflow Generated'}
              </h3>
              <p className="text-halo-textSecondary">
                {isDeveloperMode 
                  ? 'Describe your automation to generate custom code' 
                  : 'Describe your automation to get started'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-halo-text">{workflow.name}</h3>
            <p className="text-sm text-halo-textSecondary">{workflow.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onSaveWorkflow}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button className="bg-halo-primary hover:bg-halo-primary/90">
              <Play className="h-4 w-4 mr-2" />
              Test Run
            </Button>
          </div>
        </div>

        {isDeveloperMode ? (
          <DeveloperModeEditor 
            customCode={customCode}
            setCustomCode={setCustomCode}
          />
        ) : (
          <ScrollArea className="flex-1">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext 
                items={workflow.steps.map(step => step.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id}>
                      <SortableWorkflowStep step={step} index={index} />
                      {index < workflow.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="w-px h-8 bg-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};