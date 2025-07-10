import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceMetrics {
  id: string;
  workflowId: string;
  executionId: string;
  tenantId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  stepMetrics: any[];
  resourceUsage: {
    memoryUsed: number;
    cpuTime: number;
    apiCalls: number;
    dataProcessed: number;
  };
  performance: {
    avgStepDuration: number;
    totalSteps: number;
    failedSteps: number;
    retries: number;
  };
  errorDetails?: any;
}

interface PerformanceAlert {
  id: string;
  tenantId: string;
  workflowId: string;
  type: string;
  severity: string;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, metrics, alert, tenantId, workflowId, timeRange, severity, alertId } = await req.json();

    switch (action) {
      case 'store_metrics': {
        // Store performance metrics in a JSON column since we don't have dedicated tables
        const { error } = await supabase
          .from('workflow_executions')
          .update({
            performance_metrics: metrics,
            updated_at: new Date().toISOString()
          })
          .eq('id', metrics.executionId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'store_alert': {
        // Store alert in system knowledge base for now (in real system would have dedicated alerts table)
        const { error } = await supabase
          .from('system_knowledge_base')
          .insert({
            title: `Performance Alert: ${alert.type}`,
            content: JSON.stringify(alert),
            category: 'performance_alert',
            tags: [alert.severity, alert.type, alert.tenantId],
            priority: alert.severity === 'critical' ? 5 : alert.severity === 'high' ? 4 : 3
          });

        if (error) throw error;

        // Log alert for real-time monitoring
        console.log(`🚨 Performance Alert [${alert.severity.toUpperCase()}]:`, alert.message);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_metrics': {
        let query = supabase
          .from('workflow_executions')
          .select('id, workflow_id, status, started_at, completed_at, performance_metrics')
          .eq('tenant_id', tenantId);

        if (workflowId) {
          query = query.eq('workflow_id', workflowId);
        }

        if (timeRange) {
          query = query
            .gte('started_at', timeRange.start)
            .lte('started_at', timeRange.end);
        }

        const { data, error } = await query
          .order('started_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        // Transform data to include parsed metrics
        const metricsData = data?.map(execution => ({
          executionId: execution.id,
          workflowId: execution.workflow_id,
          status: execution.status,
          startTime: execution.started_at,
          endTime: execution.completed_at,
          duration: execution.completed_at 
            ? new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()
            : null,
          metrics: execution.performance_metrics
        })) || [];

        return new Response(
          JSON.stringify({ metrics: metricsData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_alerts': {
        let query = supabase
          .from('system_knowledge_base')
          .select('*')
          .eq('category', 'performance_alert')
          .contains('tags', [tenantId]);

        if (severity) {
          query = query.contains('tags', [severity]);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const alerts = data?.map(row => {
          try {
            return JSON.parse(row.content);
          } catch {
            return null;
          }
        }).filter(Boolean) || [];

        return new Response(
          JSON.stringify({ alerts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'acknowledge_alert': {
        // Find and update the alert
        const { data: alertData, error: findError } = await supabase
          .from('system_knowledge_base')
          .select('*')
          .eq('category', 'performance_alert')
          .like('content', `%"id":"${alertId}"%`)
          .single();

        if (findError) throw findError;

        if (alertData) {
          const alert = JSON.parse(alertData.content);
          alert.acknowledged = true;
          alert.acknowledgedAt = new Date().toISOString();

          const { error } = await supabase
            .from('system_knowledge_base')
            .update({
              content: JSON.stringify(alert),
              updated_at: new Date().toISOString()
            })
            .eq('id', alertData.id);

          if (error) throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_dashboard_stats': {
        // Get execution statistics for dashboard
        const { data: executions, error: execError } = await supabase
          .from('workflow_executions')
          .select('status, started_at, completed_at, performance_metrics')
          .eq('tenant_id', tenantId)
          .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

        if (execError) throw execError;

        const totalExecutions = executions?.length || 0;
        const successfulExecutions = executions?.filter(e => e.status === 'completed').length || 0;
        const failedExecutions = executions?.filter(e => e.status === 'failed').length || 0;
        const averageDuration = executions?.reduce((sum, e) => {
          if (e.completed_at) {
            return sum + (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime());
          }
          return sum;
        }, 0) / (executions?.filter(e => e.completed_at).length || 1);

        const stats = {
          totalExecutions,
          successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
          failureRate: totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0,
          averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
          throughput: totalExecutions, // executions per day
          activeExecutions: executions?.filter(e => e.status === 'running').length || 0
        };

        return new Response(
          JSON.stringify({ stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Performance monitoring error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Performance monitoring service error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});