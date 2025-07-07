import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowRecord } from '@/types/tenant';
import { useTenant } from '@/contexts/TenantContext';

interface AutomationHeaderProps {
  workflow: WorkflowRecord | null;
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isDeveloperMode: boolean;
  setIsDeveloperMode: (enabled: boolean) => void;
}

export function AutomationHeader({
  workflow,
  workflowName,
  setWorkflowName,
  isDeveloperMode,
  setIsDeveloperMode
}: AutomationHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [isEditingName, setIsEditingName] = useState(false);

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

  return (
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
  );
}