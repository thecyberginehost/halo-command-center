import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenant();

  const fetchStats = async () => {
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
          throw error;
        }

        const totalWorkflows = data?.length || 0;
        const activeWorkflows = data?.filter(w => w.status === 'active').length || 0;
        const totalExecutions = data?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0;
      
      // Calculate success rate (placeholder - in real app this would be based on execution logs)
      const successRate = totalExecutions > 0 ? 98.5 : 0;

        setStats({
          totalWorkflows,
          activeWorkflows,
          totalExecutions,
          successRate
        });
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentTenant]);

  return { stats, loading, error, refreshStats: fetchStats };
};