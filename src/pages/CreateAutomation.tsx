import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowRecord } from '@/types/tenant';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { AutomationHeader } from '@/components/automation/AutomationHeader';
import { DeveloperModeEditor } from '@/components/automation/DeveloperModeEditor';
import { VisualModeCanvas } from '@/components/automation/VisualModeCanvas';
import { StepSelectorModal } from '@/components/automation/StepSelectorModal';
import { ResonantDirectiveChat } from '@/components/automation/ResonantDirectiveChat';

import { useAutomationChat } from '@/hooks/useAutomationChat';
import { useWorkflowOperations } from '@/hooks/useWorkflowOperations';
import { WorkflowExecutionService } from '@/services/workflowExecution';

const CreateAutomation = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState<WorkflowRecord | null>(null);
  const [workflowName, setWorkflowName] = useState('My Automation');
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showStepSelector, setShowStepSelector] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [testingWorkflow, setTestingWorkflow] = useState(false);
  const [scriptCode, setScriptCode] = useState(`// Automation Script
// This will be executed when your automation runs

async function executeAutomation(input) {
  console.log('Starting automation with input:', input);
  
  // Add your automation logic here
  
  return {
    success: true,
    message: 'Automation completed successfully',
    data: input
  };
}`);

  const {
    workflowNodes,
    workflowEdges,
    handleAIWorkflowGeneration,
    handleExport,
    handleSaveWorkflow,
    handleWorkflowChange
  } = useWorkflowOperations(workflow);

  const {
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isThinking,
    handleSendMessage
  } = useAutomationChat({
    workflow,
    workflowNodes,
    workflowEdges,
    onWorkflowGeneration: handleAIWorkflowGeneration
  });

  const workflowExecutionService = new WorkflowExecutionService();

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId || !currentTenant) {
        if (!workflowId) {
          navigate('/automations');
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (error) throw error;
        
        setWorkflow(data);
        setWorkflowName(data.name);
      } catch (error) {
        console.error('Error fetching workflow:', error);
        toast({
          title: "Error",
          description: "Failed to load workflow",
          variant: "destructive"
        });
        navigate('/automations');
      }
    };

    fetchWorkflow();
  }, [workflowId, currentTenant, toast, navigate]);

  const handleTriggerSelect = (trigger: string) => {
    console.log('Selected trigger:', trigger);
    setShowStepSelector(false);
    setChatMessages(prev => [...prev, 
      { role: 'user', content: `I selected "${trigger}" as my trigger` },
      { role: 'assistant', content: `Great choice! "${trigger}" is a powerful trigger. Let me help you configure the next steps for your automation.` }
    ]);
  };

  const handleTestWorkflow = async () => {
    if (!workflow || !currentTenant) return;
    
    setTestingWorkflow(true);
    try {
      const testData = { test: true, timestamp: new Date().toISOString() };
      
      if (isDeveloperMode) {
        // Test traditional workflow
        const executionId = await workflowExecutionService.executeWorkflow(
          workflow.id,
          testData,
          currentTenant.id
        );
        
        toast({
          title: "Workflow Test Started",
          description: `Execution ID: ${executionId}`,
        });
      } else {
        // Test visual workflow
        const executionId = await workflowExecutionService.executeVisualWorkflow(
          workflow.id,
          workflowNodes,
          workflowEdges,
          testData,
          currentTenant.id
        );
        
        toast({
          title: "Visual Workflow Test Started", 
          description: `Execution ID: ${executionId}`,
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestingWorkflow(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col">
        <AutomationHeader
          workflow={workflow}
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          isDeveloperMode={isDeveloperMode}
          setIsDeveloperMode={setIsDeveloperMode}
          onExport={handleExport}
          onSave={() => handleSaveWorkflow(workflowName)}
          onTest={handleTestWorkflow}
          isTestingWorkflow={testingWorkflow}
        />

        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-96' : ''} flex flex-col`}>
          <div className="flex-1 relative">
            {isDeveloperMode ? (
              <DeveloperModeEditor
                scriptCode={scriptCode}
                setScriptCode={setScriptCode}
                setChatMessages={setChatMessages}
                onWorkflowChange={handleWorkflowChange}
                workflowNodes={workflowNodes}
                workflowEdges={workflowEdges}
              />
            ) : (
              <VisualModeCanvas
                onAddStepClick={() => setShowStepSelector(true)}
                onSaveWorkflow={() => handleSaveWorkflow(workflowName)}
                onWorkflowChange={handleWorkflowChange}
                initialNodes={workflowNodes}
                initialEdges={workflowEdges}
                onChatToggle={() => setIsChatOpen(true)}
              />
            )}

            <StepSelectorModal
              isOpen={showStepSelector}
              onClose={() => setShowStepSelector(false)}
              onTriggerSelect={handleTriggerSelect}
            />
          </div>
        </div>
      </SidebarInset>

      <ResonantDirectiveChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onWorkflowGenerated={(workflowData) => {
          // Handle workflow generation
          console.log('Generated workflow:', workflowData);
        }}
      />

    </div>
  );
};

export default CreateAutomation;