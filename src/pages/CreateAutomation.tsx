import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Search, ChevronLeft } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowRecord } from '@/types/tenant';

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
  const [isChatOpen] = useState(true); // Always open chat for this page

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
    // TODO: Add step creation logic
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
        {/* Header with Breadcrumb */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
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
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-8 relative">
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
        </div>
      </div>

      {/* Chat Sidebar - Always Open */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-primary/10 shadow-2xl flex flex-col">
        {/* Chat Header */}
        <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 text-primary-foreground">💬</div>
            <span className="text-primary-foreground font-semibold">Resonant Directive</span>
          </div>
          <p className="text-xs text-primary-foreground/90 font-medium mt-1">
            How can I assist in creating this automation?
          </p>
        </div>
        
        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <div className="flex-1 space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                I'm here to help you build your automation. You can ask me to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Suggest workflow steps</li>
                <li>• Connect different services</li>
                <li>• Help with trigger conditions</li>
                <li>• Optimize your automation</li>
              </ul>
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about your automation..."
                className="flex-1"
              />
              <Button size="sm">Send</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for step selector */}
      {showStepSelector && (
        <div 
          className="fixed inset-0 bg-black/20 z-5"
          onClick={() => setShowStepSelector(false)}
        />
      )}
    </div>
  );
};

export default CreateAutomation;