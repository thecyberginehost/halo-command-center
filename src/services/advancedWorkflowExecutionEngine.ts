import { ExecutionContext, ExecutionResult, IntegrationNode } from '@/types/integrations';
import { PerformanceMonitoringService } from './performanceMonitoringService';
import { supabase } from '@/integrations/supabase/client';

export interface ExecutionStep {
  id: string;
  name: string;
  integration: IntegrationNode;
  config: Record<string, any>;
  condition?: string;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
  };
  timeout?: number;
  dependencies?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  currentStep?: string;
  steps: ExecutionStep[];
  stepOutputs: Map<string, any>;
  errorDetails?: {
    step: string;
    error: string;
    stackTrace: string;
  };
}

export interface ExecutionOptions {
  priority?: 'low' | 'normal' | 'high' | 'critical';
  maxConcurrency?: number;
  timeout?: number;
  retryGlobal?: boolean;
  debugMode?: boolean;
}

export class AdvancedWorkflowExecutionEngine {
  private activeExecutions = new Map<string, WorkflowExecution>();
  private executionQueue: Array<{ execution: WorkflowExecution; options: ExecutionOptions }> = [];
  private performanceMonitor = new PerformanceMonitoringService();
  private maxConcurrentExecutions = 10;
  private isProcessing = false;

  async executeWorkflow(
    workflowId: string,
    tenantId: string,
    input: Record<string, any>,
    steps: ExecutionStep[],
    options: ExecutionOptions = {}
  ): Promise<string> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      tenantId,
      status: 'pending',
      startedAt: new Date(),
      input,
      steps,
      stepOutputs: new Map(),
    };

    // Add to queue
    this.executionQueue.push({ execution, options });
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processExecutionQueue();
    }

    return executionId;
  }

  private async processExecutionQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.executionQueue.length > 0 && this.activeExecutions.size < this.maxConcurrentExecutions) {
      const { execution, options } = this.executionQueue.shift()!;
      
      // Start execution
      this.activeExecutions.set(execution.id, execution);
      this.executeWorkflowSteps(execution, options).catch(error => {
        console.error(`Execution ${execution.id} failed:`, error);
        this.completeExecution(execution.id, 'failed', { error: error.message });
      });
    }

    // Check again in 1 second
    setTimeout(() => {
      if (this.executionQueue.length > 0) {
        this.processExecutionQueue();
      } else {
        this.isProcessing = false;
      }
    }, 1000);
  }

  private async executeWorkflowSteps(
    execution: WorkflowExecution,
    options: ExecutionOptions
  ): Promise<void> {
    execution.status = 'running';
    
    // Start performance monitoring
    await this.performanceMonitor.startWorkflowMetrics(
      execution.workflowId,
      execution.id,
      execution.tenantId
    );

    // Update execution in database
    await this.updateExecutionStatus(execution);

    try {
      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(execution.steps);
      
      // Execute steps in topological order
      const sortedSteps = this.topologicalSort(dependencyGraph);
      
      for (const stepId of sortedSteps) {
        const step = execution.steps.find(s => s.id === stepId);
        if (!step) continue;

        // Check if step should be executed (condition evaluation)
        if (step.condition && !this.evaluateCondition(step.condition, execution.stepOutputs)) {
          console.log(`Skipping step ${step.id} due to condition: ${step.condition}`);
          continue;
        }

        // Wait for dependencies
        await this.waitForDependencies(step, execution.stepOutputs);

        // Execute step with retry logic
        const stepResult = await this.executeStepWithRetry(step, execution, options);
        
        // Store step output
        execution.stepOutputs.set(step.id, stepResult.output);
        execution.currentStep = step.id;

        if (!stepResult.success) {
          throw new Error(`Step ${step.id} failed: ${stepResult.error}`);
        }

        // Update execution progress
        await this.updateExecutionStatus(execution);
      }

      // Complete execution successfully
      await this.completeExecution(execution.id, 'completed', {
        output: Object.fromEntries(execution.stepOutputs)
      });

    } catch (error) {
      console.error(`Workflow execution ${execution.id} failed:`, error);
      
      execution.errorDetails = {
        step: execution.currentStep || 'unknown',
        error: error.message,
        stackTrace: error.stack || ''
      };

      await this.completeExecution(execution.id, 'failed', {
        error: error.message,
        errorDetails: execution.errorDetails
      });
    }
  }

  private async executeStepWithRetry(
    step: ExecutionStep,
    execution: WorkflowExecution,
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const retryPolicy = step.retryPolicy || { maxRetries: 0, retryDelay: 1000, exponentialBackoff: false };
    let lastError: Error | null = null;

    // Start step monitoring
    await this.performanceMonitor.recordStepStart(
      execution.id,
      step.id,
      step.name,
      step.integration.id
    );

    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        // Create execution context
        const context: ExecutionContext = {
          workflowId: execution.workflowId,
          stepId: step.id,
          input: this.buildStepInput(step, execution),
          credentials: {}, // Will be populated by the integration
          previousStepOutputs: Object.fromEntries(execution.stepOutputs),
          tenantId: execution.tenantId,
          userId: undefined // TODO: Add user context
        };

        // Execute step
        const startTime = Date.now();
        const result = await this.executeIntegration(step.integration, step.config, context);
        const duration = Date.now() - startTime;

        // Record step completion
        await this.performanceMonitor.recordStepComplete(execution.id, step.id, {
          status: result.success ? 'completed' : 'failed',
          outputSize: JSON.stringify(result.output || {}).length,
          error: result.error,
          resourceUsage: {
            memory: 0, // TODO: Implement actual memory tracking
            cpu: duration,
            apiCalls: 1
          }
        });

        if (result.success) {
          return result;
        } else {
          lastError = new Error(result.error || 'Step execution failed');
          if (attempt === retryPolicy.maxRetries) {
            throw lastError;
          }
        }

      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retryPolicy.maxRetries) {
          await this.performanceMonitor.recordStepComplete(execution.id, step.id, {
            status: 'failed',
            error: error.message
          });
          throw error;
        }

        // Calculate retry delay
        let delay = retryPolicy.retryDelay;
        if (retryPolicy.exponentialBackoff) {
          delay = delay * Math.pow(2, attempt);
        }

        console.log(`Step ${step.id} failed (attempt ${attempt + 1}/${retryPolicy.maxRetries + 1}), retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Unknown execution error');
  }

  private async executeIntegration(
    integration: IntegrationNode,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      const { data, error } = await supabase.functions.invoke('execute-integration', {
        body: {
          integration: integration.id,
          config,
          context
        }
      });

      if (error) throw error;

      return {
        success: data.success,
        output: data.output,
        error: data.error,
        logs: data.logs || []
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        logs: [`Integration execution failed: ${error.message}`]
      };
    }
  }

  private buildStepInput(step: ExecutionStep, execution: WorkflowExecution): Record<string, any> {
    let input = { ...execution.input };

    // Merge outputs from previous steps
    for (const [stepId, output] of execution.stepOutputs) {
      input[`steps.${stepId}`] = output;
    }

    // Apply step-specific configuration
    Object.assign(input, step.config);

    return input;
  }

  private buildDependencyGraph(steps: ExecutionStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      graph.set(step.id, step.dependencies || []);
    }

    return graph;
  }

  private topologicalSort(graph: Map<string, string[]>): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (node: string) => {
      if (visiting.has(node)) {
        throw new Error(`Circular dependency detected involving step: ${node}`);
      }
      if (visited.has(node)) {
        return;
      }

      visiting.add(node);
      const dependencies = graph.get(node) || [];
      
      for (const dependency of dependencies) {
        visit(dependency);
      }

      visiting.delete(node);
      visited.add(node);
      result.push(node);
    };

    for (const node of graph.keys()) {
      visit(node);
    }

    return result;
  }

  private evaluateCondition(condition: string, stepOutputs: Map<string, any>): boolean {
    try {
      // Simple condition evaluation - could be enhanced with a proper expression parser
      const context = Object.fromEntries(stepOutputs);
      
      // Replace step references in condition
      let evaluatedCondition = condition;
      for (const [stepId, output] of stepOutputs) {
        evaluatedCondition = evaluatedCondition.replace(
          new RegExp(`steps\\.${stepId}`, 'g'),
          JSON.stringify(output)
        );
      }

      // Use Function constructor for safe evaluation (basic security)
      const result = new Function('context', `return ${evaluatedCondition}`)(context);
      return Boolean(result);
    } catch (error) {
      console.error(`Error evaluating condition "${condition}":`, error);
      return false;
    }
  }

  private async waitForDependencies(step: ExecutionStep, stepOutputs: Map<string, any>): Promise<void> {
    if (!step.dependencies || step.dependencies.length === 0) {
      return;
    }

    // Check if all dependencies are satisfied
    for (const dependency of step.dependencies) {
      if (!stepOutputs.has(dependency)) {
        throw new Error(`Dependency ${dependency} not satisfied for step ${step.id}`);
      }
    }
  }

  private async updateExecutionStatus(execution: WorkflowExecution): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({
          status: execution.status,
          current_step: execution.currentStep,
          updated_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      if (error) {
        console.error('Failed to update execution status:', error);
      }
    } catch (error) {
      console.error('Error updating execution status:', error);
    }
  }

  private async completeExecution(
    executionId: string,
    status: 'completed' | 'failed' | 'cancelled',
    result: { output?: any; error?: string; errorDetails?: any }
  ): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    execution.status = status;
    execution.completedAt = new Date();
    execution.output = result.output;

    // Complete performance monitoring
    await this.performanceMonitor.completeWorkflowMetrics(executionId, status);

    // Update database
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({
          status,
          completed_at: execution.completedAt.toISOString(),
          output: result.output || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      if (error) {
        console.error('Failed to complete execution:', error);
      }
    } catch (error) {
      console.error('Error completing execution:', error);
    }

    // Clean up
    this.activeExecutions.delete(executionId);
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    await this.completeExecution(executionId, 'cancelled', {});
  }

  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    return this.activeExecutions.get(executionId) || null;
  }

  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }
}