import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowRecord } from '@/types/tenant';
import { useTenant } from '@/contexts/TenantContext';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenant();

  const fetchWorkflows = async () => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error('Error fetching workflows:', error);
      } else {
        setWorkflows(data || []);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [currentTenant]);

  const refreshWorkflows = () => {
    fetchWorkflows();
  };

  return {
    workflows,
    loading,
    error,
    refreshWorkflows
  };
};