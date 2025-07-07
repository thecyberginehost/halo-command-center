import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import { WorkflowRecord } from '@/types/tenant';

const WorkflowBuilderPage = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<WorkflowRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId || !currentTenant) {
        navigate('/automations');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (error) {
          throw error;
        }

        setWorkflow(data);
      } catch (error) {
        console.error('Error fetching workflow:', error);
        toast({
          title: "Error",
          description: "Failed to load workflow",
          variant: "destructive"
        });
        navigate('/automations');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId, currentTenant, navigate, toast]);

  const handleClose = () => {
    navigate('/automations');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-lg">Loading workflow...</div>
      </div>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <WorkflowBuilder 
        onClose={handleClose}
        initialWorkflow={workflow}
      />
    </div>
  );
};

export default WorkflowBuilderPage;