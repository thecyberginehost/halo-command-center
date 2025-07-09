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
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
      />

    </div>
  );
};

export default CreateAutomation;