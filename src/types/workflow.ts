export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

export interface WorkflowTrigger extends WorkflowStep {
  type: 'trigger';
  triggerType: 'webhook' | 'schedule' | 'email' | 'form_submit' | 'file_upload';
}

export interface WorkflowAction extends WorkflowStep {
  type: 'action';
  actionType: 'email' | 'slack' | 'webhook' | 'database' | 'file_operation' | 'ai_process';
}

export interface WorkflowCondition extends WorkflowStep {
  type: 'condition';
  conditionType: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  executionCount: number;
  lastExecuted?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  currentStep?: string;
  logs: ExecutionLog[];
  input: Record<string, any>;
  output?: Record<string, any>;
}

export interface ExecutionLog {
  id: string;
  stepId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: Record<string, any>;
}

export interface AIGenerationRequest {
  prompt: string;
  context?: Record<string, any>;
  preferredIntegrations?: string[];
}

export interface AIGenerationResponse {
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount'>;
  explanation: string;
  suggestions: string[];
}