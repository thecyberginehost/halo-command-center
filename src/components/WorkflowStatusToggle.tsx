import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkflowRecord } from '@/types/tenant';

interface WorkflowStatusToggleProps {
  workflow: WorkflowRecord;
  onStatusChanged?: () => void;
}

export function WorkflowStatusToggle({ workflow, onStatusChanged }: WorkflowStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    setLoading(true);

    const newStatus = workflow.status === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Workflow ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
      });

      onStatusChanged?.();

    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update workflow status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isActive = workflow.status === 'active';

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleToggleStatus}
      disabled={loading}
      className={isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isActive ? (
        <Pause className="h-4 w-4 mr-2" />
      ) : (
        <Play className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Updating...' : isActive ? 'Pause' : workflow.status === 'draft' ? 'Activate' : 'Resume'}
    </Button>
  );
}