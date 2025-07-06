import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Play, 
  Save, 
  Settings, 
  Zap,
  Mail,
  Webhook,
  Database,
  MessageSquare,
  Clock,
  GitBranch,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Workflow, WorkflowStep } from '@/types/workflow';
import { WorkflowAIService } from '@/services/workflowAI';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface WorkflowBuilderProps {
  onClose: () => void;
}

const stepIcons = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  delay: Clock,
  utility: Settings
};

const stepColors = {
  trigger: 'bg-halo-accent',
  action: 'bg-halo-primary', 
  condition: 'bg-halo-secondary',
  delay: 'bg-gray-500',
  utility: 'bg-purple-500'
};

const WorkflowBuilder = ({ onClose }: WorkflowBuilderProps) => {
  const [prompt, setPrompt] = useState('');
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<{
    estimated_execution_time?: string;
    reliability_score?: string;
    maintenance_requirements?: string;
  } | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && workflow) {
      const oldIndex = workflow.steps.findIndex(step => step.id === active.id);
      const newIndex = workflow.steps.findIndex(step => step.id === over?.id);

      setWorkflow({
        ...workflow,
        steps: arrayMove(workflow.steps, oldIndex, newIndex)
      });

      toast({
        title: "Steps Reordered",
        description: "Workflow steps have been successfully reordered.",
      });
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe the automation you want to create.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const aiService = new WorkflowAIService();
      const response = await aiService.generateWorkflow({ 
        prompt,
        tenantId: currentTenant?.id
      });
      
      const newWorkflow: Workflow = {
        ...response.workflow,
        id: `workflow-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
        executionCount: 0
      };

      setWorkflow(newWorkflow);
      setExplanation(response.explanation);
      setSuggestions(response.suggestions);
      setComplexityAnalysis(response.complexity_analysis || null);
      
      toast({
        title: "Workflow Generated!",
        description: `Advanced workflow created with o3 reasoning. Reliability: ${response.complexity_analysis?.reliability_score || 'N/A'}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkflow = () => {
    if (!workflow) return;
    
    // TODO: Implement actual save functionality
    toast({
      title: "Workflow Saved",
      description: `"${workflow.name}" has been saved successfully.`,
    });
  };

  // Sortable Workflow Step Component
  const SortableWorkflowStep = ({ step, index }: { step: WorkflowStep; index: number }) => {
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

  return (
    <div className="h-full flex flex-col bg-halo-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-halo-accent rounded-lg">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
            <div>
              <h2 className="text-xl font-bold text-halo-text">AI Workflow Builder</h2>
              <p className="text-sm text-halo-textSecondary">Powered by o3 reasoning for advanced automation logic</p>
            </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="w-96 border-r bg-white p-6 flex flex-col">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-halo-text mb-2 block">
                Describe Your Automation
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: When someone fills out our contact form, send them a welcome email, add them to our CRM, and notify our sales team in Slack"
                className="min-h-32 resize-none"
              />
            </div>
            
            <Button 
              onClick={handleGenerateWorkflow}
              disabled={isGenerating}
              className="w-full bg-halo-accent hover:bg-halo-accent/90"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>

            {explanation && (
              <div className="mt-6">
                <h3 className="font-medium text-halo-text mb-2">Explanation</h3>
                <p className="text-sm text-halo-textSecondary bg-gray-50 p-3 rounded-lg">
                  {explanation}
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-halo-text mb-2">o3 Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="text-xs text-halo-textSecondary bg-blue-50 p-2 rounded">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complexityAnalysis && (
              <div className="mt-4">
                <h3 className="font-medium text-halo-text mb-2">Complexity Analysis</h3>
                <div className="space-y-2 text-xs">
                  {complexityAnalysis.estimated_execution_time && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Execution Time:</span> {complexityAnalysis.estimated_execution_time}
                    </div>
                  )}
                  {complexityAnalysis.reliability_score && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Reliability:</span> 
                      <Badge variant={
                        complexityAnalysis.reliability_score === 'high' ? 'default' : 
                        complexityAnalysis.reliability_score === 'medium' ? 'secondary' : 'outline'
                      } className="ml-2">
                        {complexityAnalysis.reliability_score}
                      </Badge>
                    </div>
                  )}
                  {complexityAnalysis.maintenance_requirements && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Maintenance:</span> {complexityAnalysis.maintenance_requirements}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Preview */}
        <div className="flex-1 p-6">
          {workflow ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-halo-text">{workflow.name}</h3>
                  <p className="text-sm text-halo-textSecondary">{workflow.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleSaveWorkflow}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button className="bg-halo-primary hover:bg-halo-primary/90">
                    <Play className="h-4 w-4 mr-2" />
                    Test Run
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
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
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Wand2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-halo-text">No Workflow Generated</h3>
                  <p className="text-halo-textSecondary">Describe your automation to get started</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;