import { supabase } from '@/integrations/supabase/client';
import { WorkflowStep } from '@/types/workflow';
import { ExecutionContext, ExecutionResult, IntegrationNode } from '@/types/integrations';
import { getIntegrationById } from '@/lib/integrations';

export class WorkflowExecutionService {
  async executeWorkflow(workflowId: string, triggerData: Record<string, any>): Promise<string> {
    try {
      // Start workflow execution
      const { data: execution, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflowId,
          status: 'running',
          input: triggerData,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Execute workflow steps in background
      this.executeStepsInBackground(execution.id, workflowId, triggerData);

      return execution.id;
    } catch (error) {
      console.error('Failed to start workflow execution:', error);
      throw error;
    }
  }

  private async executeStepsInBackground(
    executionId: string, 
    workflowId: string, 
    triggerData: Record<string, any>
  ) {
    try {
      // Get workflow steps
      const { data: workflow } = await supabase
        .from('workflows')
        .select('steps')
        .eq('id', workflowId)
        .single();

      if (!workflow) throw new Error('Workflow not found');

      const steps = Array.isArray(workflow.steps) ? workflow.steps as WorkflowStep[] : [];
      let previousOutputs: Record<string, any> = { trigger: triggerData };

      // Execute each step
      for (const step of steps) {
        try {
          await this.updateExecutionStatus(executionId, 'running', step.id);
          
          const result = await this.executeStep(step, {
            workflowId,
            stepId: step.id,
            input: triggerData,
            credentials: {}, // TODO: Get from secure storage
            previousStepOutputs: previousOutputs
          });

          if (!result.success) {
            throw new Error(result.error || 'Step execution failed');
          }

          previousOutputs[step.id] = result.output;
          await this.logStepExecution(executionId, step.id, 'success', result);

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

      // Call the appropriate edge function based on integration
      const { data, error } = await supabase.functions.invoke('execute-integration', {
        body: {
          integration: integration.id,
          endpoint: step.config.endpoint || integration.endpoints[0]?.id,
          config: step.config,
          context
        }
      });

      if (error) throw error;

      return {
        success: true,
        output: data,
        logs: [`Step ${step.id} executed successfully`]
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        logs: [`Step ${step.id} failed: ${error.message}`]
      };
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