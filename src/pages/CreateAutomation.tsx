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
import { FloatingChatButton } from '@/components/automation/FloatingChatButton';
import { AutomationImportExportService } from '@/services/automationImportExport';

const CreateAutomation = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState<WorkflowRecord | null>(null);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
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
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: "I'm here to help you build your automation. You can ask me to suggest workflow steps, connect different services, help with trigger conditions, or debug your code!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');

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

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant', 
        content: `I understand you want help with: "${chatInput}". Let me assist you with that automation requirement.`
      }]);
    }, 1000);
  };

  const handleExport = async () => {
    if (!workflow) return;
    
    try {
      await AutomationImportExportService.exportWorkflow(workflow);
      toast({
        title: "Export Successful",
        description: `"${workflow.name}" has been exported to your downloads.`
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "Failed to export automation.",
        variant: "destructive"
      });
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflow || !currentTenant) return;
    
    try {
      // Convert visual workflow to steps format
      const steps = workflowNodes.map((node, index) => ({
        id: node.id,
        type: node.data.integration.type,
        name: node.data.integration.name,
        config: node.data.config || {},
        position: { x: node.position.x, y: node.position.y },
        order: index
      }));

      const { error } = await supabase
        .from('workflows')
        .update({
          name: workflowName,
          steps: steps,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;
      
      toast({
        title: "Workflow Saved",
        description: `Saved ${steps.length} workflow steps successfully.`
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workflow.",
        variant: "destructive"
      });
    }
  };

  const handleWorkflowChange = (nodes: any[], edges: any[]) => {
    setWorkflowNodes(nodes);
    setWorkflowEdges(edges);
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
          onSave={handleSaveWorkflow}
        />

        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-96' : ''} flex flex-col`}>
          <div className="flex-1 relative">
            {isDeveloperMode ? (
              <DeveloperModeEditor
                scriptCode={scriptCode}
                setScriptCode={setScriptCode}
                setChatMessages={setChatMessages}
              />
            ) : (
              <VisualModeCanvas
                onAddStepClick={() => setShowStepSelector(true)}
                onSaveWorkflow={handleSaveWorkflow}
                onWorkflowChange={handleWorkflowChange}
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
      />

      {!isChatOpen && (
        <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      )}
    </div>
  );
};

export default CreateAutomation;