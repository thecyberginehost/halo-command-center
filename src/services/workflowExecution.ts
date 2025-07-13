import { supabase } from '@/integrations/supabase/client';
import { WorkflowStep } from '@/types/workflow';
import { ExecutionContext, ExecutionResult, IntegrationNode } from '@/types/integrations';
import { getIntegrationById } from '@/lib/integrations';
import { CredentialsService } from './credentialsService';

export class WorkflowExecutionService {
  private credentialsService = new CredentialsService();

  async executeWorkflow(workflowId: string, triggerData: Record<string, any>, tenantId?: string): Promise<string> {
    try {
      // Start workflow execution
      const { data: execution, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflowId,
          tenant_id: tenantId || 'default-tenant',
          status: 'running',
          input: triggerData,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Execute workflow steps in background
      this.executeStepsInBackground(execution.id, workflowId, triggerData, tenantId || 'default-tenant');

      return execution.id;
    } catch (error) {
      console.error('Failed to start workflow execution:', error);
      throw error;
    }
  }

  private async executeStepsInBackground(
    executionId: string, 
    workflowId: string, 
    triggerData: Record<string, any>,
    tenantId: string
  ) {
    try {
      // Get workflow steps
      const { data: workflow } = await supabase
        .from('workflows')
        .select('steps')
        .eq('id', workflowId)
        .single();

      if (!workflow) throw new Error('Workflow not found');

      const steps = Array.isArray(workflow.steps) ? workflow.steps as unknown as WorkflowStep[] : [];
      let previousOutputs: Record<string, any> = { trigger: triggerData };

      // Execute each step
      for (const step of steps) {
        try {
          await this.updateExecutionStatus(executionId, 'running', step.id);
          
          // Get credentials for this step's integration
          const credentials = await this.getCredentialsForStep(step, tenantId);
          
          const result = await this.executeStep(step, {
            workflowId,
            stepId: step.id,
            input: triggerData,
            credentials,
            previousStepOutputs: previousOutputs,
            tenantId
          });

          if (!result.success) {
            throw new Error(result.error || 'Step execution failed');
          }

          previousOutputs[step.id] = result.output;
          await this.logStepExecution(executionId, step.id, 'info', result);

        } catch (error) {
          await this.logStepExecution(executionId, step.id, 'error', { error: error.message });
          await this.updateExecutionStatus(executionId, 'failed');
          return;
        }
      }

      // Mark as completed
      await this.updateExecutionStatus(executionId, 'completed', undefined, previousOutputs);

    } catch (error) {
      console.error('Workflow execution failed:', error);
      await this.updateExecutionStatus(executionId, 'failed');
    }
  }

  private async executeStep(step: WorkflowStep, context: ExecutionContext): Promise<ExecutionResult> {
    try {
      const integration = getIntegrationById(step.type);
      if (!integration) {
        throw new Error(`Integration not found for step type: ${step.type}`);
      }

      // Call the integration execution engine
      const { data, error } = await supabase.functions.invoke('execute-integration', {
        body: {
          integration: integration.id,
          endpoint: step.config.endpoint || integration.endpoints[0]?.id,
          config: step.config,
          context: {
            ...context,
            tenantId: context.tenantId || 'default-tenant'
          }
        }
      });

      if (error) throw error;

      return {
        success: data.success,
        output: data.output,
        logs: data.logs || [`Step ${step.id} executed`]
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        logs: [`Step ${step.id} failed: ${error.message}`]
      };
    }
  }

  // Get credentials for a specific step
  private async getCredentialsForStep(step: WorkflowStep, tenantId: string): Promise<Record<string, any>> {
    try {
      // Get integration details to determine service type
      const integration = getIntegrationById(step.type);
      if (!integration) return {};

      // Map integration IDs to service types
      const serviceTypeMap = {
        'openai': 'openai',
        'anthropic': 'anthropic', 
        'gmail': 'gmail',
        'slack': 'slack',
        'salesforce': 'salesforce',
        'hubspot': 'hubspot'
      };

      const serviceType = serviceTypeMap[integration.id];
      if (!serviceType) return {};

      // Get credentials for this service type
      const credentials = await this.credentialsService.getCredentialsByService(tenantId, serviceType);
      if (credentials.length === 0) return {};

      // Return the first available credential (or could be configured per step)
      return credentials[0].credentials;
    } catch (error) {
      console.error('Failed to get credentials for step:', error);
      return {};
    }
  }

  // New method to execute visual workflows
  async executeVisualWorkflow(workflowId: string, nodes: any[], edges: any[], triggerData: Record<string, any>, tenantId?: string): Promise<string> {
    try {
      // Convert visual workflow to traditional workflow steps
      const steps = nodes.filter(node => node.data.integration.type !== 'trigger').map(node => ({
        id: node.id,
        type: node.data.integration.id,
        title: node.data.integration.name,
        description: node.data.integration.description,
        config: node.data.config,
        position: node.position,
        connections: edges.filter(edge => edge.source === node.id).map(edge => edge.target)
      }));

      // Start execution
      const { data: execution, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflowId,
          tenant_id: tenantId || 'default-tenant',
          status: 'running',
          input: triggerData,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Execute steps in background
      this.executeVisualStepsInBackground(execution.id, steps, triggerData, tenantId || 'default-tenant');

      return execution.id;
    } catch (error) {
      console.error('Failed to start visual workflow execution:', error);
      throw error;
    }
  }

  private async executeVisualStepsInBackground(
    executionId: string,
    steps: any[],
    triggerData: Record<string, any>,
    tenantId: string
  ) {
    try {
      let previousOutputs: Record<string, any> = { trigger: triggerData };

      for (const step of steps) {
        try {
          await this.updateExecutionStatus(executionId, 'running', step.id);
          
          // Get credentials for this step's integration
          const credentials = await this.getCredentialsForStep(step, tenantId);
          
          const result = await this.executeStep(step, {
            workflowId: executionId,
            stepId: step.id,
            input: triggerData,
            credentials,
            previousStepOutputs: previousOutputs,
            tenantId
          });

          if (!result.success) {
            throw new Error(result.error || 'Step execution failed');
          }

          previousOutputs[step.id] = result.output;
          await this.logStepExecution(executionId, step.id, 'info', result);

        } catch (error) {
          await this.logStepExecution(executionId, step.id, 'error', { error: error.message });
          await this.updateExecutionStatus(executionId, 'failed');
          return;
        }
      }

      await this.updateExecutionStatus(executionId, 'completed', undefined, previousOutputs);

    } catch (error) {
      console.error('Visual workflow execution failed:', error);
      await this.updateExecutionStatus(executionId, 'failed');
    }
  }

  private async updateExecutionStatus(
    executionId: string, 
    status: string, 
    currentStep?: string,
    output?: Record<string, any>
  ) {
    const updates: any = { 
      status,
      current_step: currentStep,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.output = output;
    }

    await supabase
      .from('workflow_executions')
      .update(updates)
      .eq('id', executionId);
  }

  private async logStepExecution(
    executionId: string,
    stepId: string,
    level: 'info' | 'error' | 'warning',
    data: any
  ) {
    await supabase
      .from('execution_logs')
      .insert({
        execution_id: executionId,
        step_id: stepId,
        level,
        message: level === 'error' ? data.error : 'Step executed',
        data,
        timestamp: new Date().toISOString()
      });
  }

  async getExecutionStatus(executionId: string) {
    const { data } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        execution_logs (*)
      `)
      .eq('id', executionId)
      .single();

    return data;
  }
}