import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, ChevronLeft, MessageCircle, X, Bug, Play } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowRecord } from '@/types/tenant';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const CreateAutomation = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState<WorkflowRecord | null>(null);
  const [workflowName, setWorkflowName] = useState('My Automation');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showStepSelector, setShowStepSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
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

  const triggerOptions = [
    'Trigger manually',
    'On app event', 
    'On a schedule',
    'On webhook call',
    'On form submission',
    'When executed by another workflow',
    'On chat message',
    'On database change',
    'On file upload',
    'On email received'
  ];

  const filteredTriggers = triggerOptions.filter(trigger =>
    trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId || !currentTenant) {
        // If no workflowId, redirect to create a new one
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

  const handleNameSave = async () => {
    if (!workflow || !currentTenant) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .update({ name: workflowName })
        .eq('id', workflow.id)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      setIsEditingName(false);
      toast({
        title: "Success",
        description: "Automation name updated"
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error", 
        description: "Failed to update name",
        variant: "destructive"
      });
    }
  };

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

  const handleDebugCode = () => {
    setChatMessages(prev => [...prev, 
      { role: 'user', content: 'Please debug my automation script' },
      { role: 'assistant', content: 'I\'ll analyze your script for potential issues. Let me check the syntax, logic flow, and suggest improvements...' }
    ]);
  };

  const handleRunScript = () => {
    console.log('Running script:', scriptCode);
    toast({
      title: "Script Execution",
      description: "Script is running in test mode...",
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/automations')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Automations</span>
            <span>/</span>
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave();
                    if (e.key === 'Escape') {
                      setWorkflowName(workflow?.name || 'My Automation');
                      setIsEditingName(false);
                    }
                  }}
                  className="h-6 text-sm font-medium text-foreground"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {workflowName}
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-4">
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
          </div>
        </header>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
          <div className="p-8 relative">
            {isDeveloperMode ? (
              // Developer Mode - Script Editor
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Automation Script</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleDebugCode}>
                      <Bug className="h-4 w-4 mr-2" />
                      Debug Code
                    </Button>
                    <Button onClick={handleRunScript}>
                      <Play className="h-4 w-4 mr-2" />
                      Test Run
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg">
                  <Textarea
                    value={scriptCode}
                    onChange={(e) => setScriptCode(e.target.value)}
                    className="min-h-[500px] font-mono text-sm resize-none border-0 focus-visible:ring-0"
                    placeholder="Write your automation script here..."
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Use async/await for asynchronous operations</p>
                  <p>• Return an object with success, message, and data properties</p>
                  <p>• Console.log statements will appear in the execution logs</p>
                </div>
              </div>
            ) : (
              // Visual Mode - Drag & Drop
              <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center">
                  <div 
                    className="relative inline-block cursor-pointer group"
                    onClick={() => setShowStepSelector(true)}
                  >
                    <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                      <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground">
                      Add first step...
                    </p>
                  </div>

                  {/* Step Selector Toolbar */}
                  {showStepSelector && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-popover border rounded-lg shadow-lg p-4 w-80 z-10">
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search for nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredTriggers.map((trigger) => (
                            <button
                              key={trigger}
                              onClick={() => handleTriggerSelect(trigger)}
                              className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors text-sm"
                            >
                              {trigger}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end space-x-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowStepSelector(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-primary/10 shadow-2xl flex flex-col z-20">
          {/* Chat Header */}
          <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-primary to-secondary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 text-primary-foreground">💬</div>
                <span className="text-primary-foreground font-semibold">Resonant Directive</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/90 font-medium mt-1">
              How can I assist in creating this automation?
            </p>
          </div>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about your automation..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSendMessage}>Send</Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button - When chat is closed */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-20 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay for step selector */}
      {showStepSelector && (
        <div 
          className="fixed inset-0 bg-black/20 z-10"
          onClick={() => setShowStepSelector(false)}
        />
      )}
    </div>
  );
};

export default CreateAutomation;