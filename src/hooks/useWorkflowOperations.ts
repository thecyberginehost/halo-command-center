import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowRecord } from '@/types/tenant';
import { AutomationImportExportService } from '@/services/automationImportExport';

export const useWorkflowOperations = (workflow: WorkflowRecord | null) => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);

  const handleAIWorkflowGeneration = useCallback((workflowData: any) => {
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
  }, [toast]);

  const handleExport = useCallback(async () => {
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
  }, [workflow, toast]);

  const handleSaveWorkflow = useCallback(async (workflowName: string) => {
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
  }, [workflow, currentTenant, workflowNodes, toast]);

  const handleWorkflowChange = useCallback((nodes: any[], edges: any[]) => {
    setWorkflowNodes(nodes);
    setWorkflowEdges(edges);
  }, []);

  return {
    workflowNodes,
    workflowEdges,
    setWorkflowNodes,
    setWorkflowEdges,
    handleAIWorkflowGeneration,
    handleExport,
    handleSaveWorkflow,
    handleWorkflowChange
  };
};