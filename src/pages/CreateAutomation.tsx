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
      content: "I'm Resonant Directive, your AI automation architect! I can build complete workflows from your descriptions, analyze your current automation, and suggest optimizations. What would you like to create?"
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

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      const response = await fetch(`https://fa2c1194-766b-4677-957f-c1ca20f0d01e.supabase.co/functions/v1/ai-chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bHRpamd4cndoZHVkaHppY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjM4MDUsImV4cCI6MjA2NzM5OTgwNX0.Vu4GrS5lgDBpWErm6evBXAZM1jhl75m-3tXJXiz66ZE`
        },
        body: JSON.stringify({
          message: currentInput,
          tenantId: currentTenant?.id,
          context: {
            currentPage: `/automations/create/${workflowId}`,
            currentWorkflow: workflow,
            currentWorkflowNodes: workflowNodes,
            currentWorkflowEdges: workflowEdges,
            workflowCount: 1
          },
          conversationHistory: chatMessages.slice(-10) // Last 10 messages for context
        })
      });

      const data = await response.json();
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant', 
        content: data.message
      }]);

      // If AI generated workflow data, apply it to the canvas
      if (data.workflowData && data.workflowData.action === 'build_workflow') {
        handleAIWorkflowGeneration(data.workflowData);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    }
  };

  const handleAIWorkflowGeneration = (workflowData: any) => {
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) return;

    // Convert AI-generated nodes to visual workflow format
    const newNodes = workflowData.nodes.map((node: any) => ({
      id: node.id || `node-${Date.now()}-${Math.random()}`,
      type: 'integrationNode',
      position: node.position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        integration: {
          id: node.integration,
          name: node.name,
          type: node.type,
          color: node.type === 'trigger' ? '#10B981' : '#3B82F6',
          icon: () => null // Will be set by integration system
        },
        config: node.config || {},
        label: node.name,
        isConfigured: false,
      },
    }));

    // Convert connections to edges
    const newEdges = (workflowData.connections || []).map((conn: any, index: number) => ({
      id: `edge-${index}`,
      source: conn.source,
      target: conn.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    }));

    // Update workflow state
    setWorkflowNodes(newNodes);
    setWorkflowEdges(newEdges);
    
    toast({
      title: "Workflow Generated!",
      description: `Created ${newNodes.length} nodes with ${newEdges.length} connections`
    });
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
      />

      {!isChatOpen && (
        <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      )}
    </div>
  );
};

export default CreateAutomation;