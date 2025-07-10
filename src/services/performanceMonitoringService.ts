import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface WorkflowMetrics {
  id: string;
  workflowId: string;
  executionId: string;
  tenantId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  stepMetrics: StepMetric[];
  resourceUsage: {
    memoryUsed: number;
    cpuTime: number;
    apiCalls: number;
    dataProcessed: number;
  };
  errorDetails?: {
    step: string;
    error: string;
    stackTrace?: string;
  };
  performance: {
    avgStepDuration: number;
    totalSteps: number;
    failedSteps: number;
    retries: number;
  };
}

export interface StepMetric {
  stepId: string;
  stepName: string;
  integrationId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputSize: number;
  outputSize: number;
  retryCount: number;
  errorMessage?: string;
  resourceUsage: {
    memory: number;
    cpu: number;
    apiCalls: number;
  };
}

export interface PerformanceAlert {
  id: string;
  tenantId: string;
  workflowId: string;
  type: 'slow_execution' | 'high_failure_rate' | 'resource_limit' | 'api_quota_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

export class PerformanceMonitoringService {
  private metricsBuffer: Map<string, WorkflowMetrics> = new Map();
  private alertThresholds = {
    slowExecution: 30000, // 30 seconds
    highFailureRate: 0.2, // 20%
    memoryLimit: 512, // MB
    apiQuotaWarning: 0.8 // 80% of quota
  };

  async startWorkflowMetrics(
    workflowId: string,
    executionId: string,
    tenantId: string
  ): Promise<WorkflowMetrics> {
    const metrics: WorkflowMetrics = {
      id: `metrics-${Date.now()}`,
      workflowId,
      executionId,
      tenantId,
      startTime: new Date(),
      status: 'running',
      stepMetrics: [],
      resourceUsage: {
        memoryUsed: 0,
        cpuTime: 0,
        apiCalls: 0,
        dataProcessed: 0
      },
      performance: {
        avgStepDuration: 0,
        totalSteps: 0,
        failedSteps: 0,
        retries: 0
      }
    };

    this.metricsBuffer.set(executionId, metrics);
    return metrics;
  }

  async recordStepStart(
    executionId: string,
    stepId: string,
    stepName: string,
    integrationId: string
  ): Promise<void> {
    const metrics = this.metricsBuffer.get(executionId);
    if (!metrics) return;

    const stepMetric: StepMetric = {
      stepId,
      stepName,
      integrationId,
      startTime: new Date(),
      status: 'running',
      inputSize: 0,
      outputSize: 0,
      retryCount: 0,
      resourceUsage: {
        memory: 0,
        cpu: 0,
        apiCalls: 0
      }
    };

    metrics.stepMetrics.push(stepMetric);
    metrics.performance.totalSteps++;
  }

  async recordStepComplete(
    executionId: string,
    stepId: string,
    result: {
      status: 'completed' | 'failed';
      outputSize?: number;
      error?: string;
      resourceUsage?: Partial<StepMetric['resourceUsage']>;
    }
  ): Promise<void> {
    const metrics = this.metricsBuffer.get(executionId);
    if (!metrics) return;

    const stepMetric = metrics.stepMetrics.find(s => s.stepId === stepId);
    if (!stepMetric) return;

    stepMetric.endTime = new Date();
    stepMetric.duration = stepMetric.endTime.getTime() - stepMetric.startTime.getTime();
    stepMetric.status = result.status;
    stepMetric.outputSize = result.outputSize || 0;
    stepMetric.errorMessage = result.error;

    if (result.resourceUsage) {
      Object.assign(stepMetric.resourceUsage, result.resourceUsage);
    }

    if (result.status === 'failed') {
      metrics.performance.failedSteps++;
    }

    // Update aggregate metrics
    metrics.resourceUsage.memoryUsed += stepMetric.resourceUsage.memory;
    metrics.resourceUsage.cpuTime += stepMetric.resourceUsage.cpu;
    metrics.resourceUsage.apiCalls += stepMetric.resourceUsage.apiCalls;
    metrics.resourceUsage.dataProcessed += stepMetric.inputSize + stepMetric.outputSize;

    // Calculate average step duration
    const completedSteps = metrics.stepMetrics.filter(s => s.duration);
    metrics.performance.avgStepDuration = 
      completedSteps.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSteps.length;

    // Check for performance alerts
    await this.checkPerformanceAlerts(metrics);
  }

  async completeWorkflowMetrics(
    executionId: string,
    status: 'completed' | 'failed' | 'cancelled'
  ): Promise<void> {
    const metrics = this.metricsBuffer.get(executionId);
    if (!metrics) return;

    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    metrics.status = status;

    // Store metrics in database
    await this.persistMetrics(metrics);

    // Clean up buffer
    this.metricsBuffer.delete(executionId);
  }

  private async persistMetrics(metrics: WorkflowMetrics): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('store-performance-metrics', {
        body: { metrics }
      });

      if (error) {
        console.error('Failed to persist metrics:', error);
      }
    } catch (error) {
      console.error('Error persisting metrics:', error);
    }
  }

  private async checkPerformanceAlerts(metrics: WorkflowMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];

    // Check slow execution
    if (metrics.duration && metrics.duration > this.alertThresholds.slowExecution) {
      alerts.push({
        id: `alert-${Date.now()}`,
        tenantId: metrics.tenantId,
        workflowId: metrics.workflowId,
        type: 'slow_execution',
        severity: metrics.duration > this.alertThresholds.slowExecution * 2 ? 'high' : 'medium',
        message: `Workflow execution is taking longer than expected: ${metrics.duration}ms`,
        threshold: this.alertThresholds.slowExecution,
        currentValue: metrics.duration,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Check failure rate
    const failureRate = metrics.performance.failedSteps / metrics.performance.totalSteps;
    if (failureRate > this.alertThresholds.highFailureRate) {
      alerts.push({
        id: `alert-${Date.now()}`,
        tenantId: metrics.tenantId,
        workflowId: metrics.workflowId,
        type: 'high_failure_rate',
        severity: failureRate > 0.5 ? 'critical' : 'high',
        message: `High failure rate detected: ${(failureRate * 100).toFixed(1)}%`,
        threshold: this.alertThresholds.highFailureRate,
        currentValue: failureRate,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Check memory usage
    if (metrics.resourceUsage.memoryUsed > this.alertThresholds.memoryLimit) {
      alerts.push({
        id: `alert-${Date.now()}`,
        tenantId: metrics.tenantId,
        workflowId: metrics.workflowId,
        type: 'resource_limit',
        severity: 'medium',
        message: `High memory usage: ${metrics.resourceUsage.memoryUsed}MB`,
        threshold: this.alertThresholds.memoryLimit,
        currentValue: metrics.resourceUsage.memoryUsed,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Store alerts
    for (const alert of alerts) {
      await this.storeAlert(alert);
    }
  }

  private async storeAlert(alert: PerformanceAlert): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('store-performance-alert', {
        body: { alert }
      });

      if (error) {
        console.error('Failed to store alert:', error);
      }
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  async getWorkflowMetrics(
    tenantId: string,
    workflowId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<WorkflowMetrics[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-performance-metrics', {
        body: { tenantId, workflowId, timeRange }
      });

      if (error) throw error;
      return data.metrics || [];
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  }

  async getPerformanceAlerts(
    tenantId: string,
    severity?: PerformanceAlert['severity']
  ): Promise<PerformanceAlert[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-performance-alerts', {
        body: { tenantId, severity }
      });

      if (error) throw error;
      return data.alerts || [];
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('acknowledge-performance-alert', {
        body: { alertId }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }
}