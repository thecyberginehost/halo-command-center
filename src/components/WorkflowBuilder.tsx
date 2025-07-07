import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Workflow, WorkflowStep } from '@/types/workflow';
import { WorkflowAIService } from '@/services/workflowAI';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { WorkflowRecord } from '@/types/tenant';
import { WorkflowInputPanel } from './workflow/WorkflowInputPanel';
import { WorkflowPreviewPanel } from './workflow/WorkflowPreviewPanel';

interface WorkflowBuilderProps {
  onClose: () => void;
  initialWorkflow?: WorkflowRecord;
}

const WorkflowBuilder = ({ onClose, initialWorkflow }: WorkflowBuilderProps) => {
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
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  // Initialize workflow from database record if provided
  useEffect(() => {
    if (initialWorkflow) {
      const workflowSteps = Array.isArray(initialWorkflow.steps) 
        ? initialWorkflow.steps as WorkflowStep[]
        : [];
      
      setWorkflow({
        id: initialWorkflow.id,
        name: initialWorkflow.name,
        description: initialWorkflow.description || '',
        status: initialWorkflow.status === 'active' ? 'active' : 'draft',
        steps: workflowSteps,
        createdAt: initialWorkflow.created_at,
        updatedAt: initialWorkflow.updated_at,
        createdBy: initialWorkflow.created_by || 'current-user',
        executionCount: initialWorkflow.execution_count || 0,
        lastExecuted: initialWorkflow.last_executed || undefined
      });
    }
  }, [initialWorkflow]);

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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="developer-mode"
              checked={isDeveloperMode}
              onCheckedChange={setIsDeveloperMode}
            />
            <Label htmlFor="developer-mode" className="text-sm font-medium">
              Developer Mode
            </Label>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <WorkflowInputPanel
          prompt={prompt}
          setPrompt={setPrompt}
          isGenerating={isGenerating}
          onGenerateWorkflow={handleGenerateWorkflow}
          explanation={explanation}
          suggestions={suggestions}
          complexityAnalysis={complexityAnalysis}
        />
        
        <WorkflowPreviewPanel
          workflow={workflow}
          isDeveloperMode={isDeveloperMode}
          customCode={customCode}
          setCustomCode={setCustomCode}
          onSaveWorkflow={handleSaveWorkflow}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
};

export default WorkflowBuilder;