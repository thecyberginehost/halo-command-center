export interface BaseIntegration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon?: any;
  color: string;
  requiresAuth: boolean;
  authType?: 'api_key' | 'oauth' | 'basic' | 'bearer';
  configSchema: Record<string, ConfigField>;
}

export interface ConfigField {
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'number' | 'boolean';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export type IntegrationCategory = 
  | 'communication'
  | 'crm' 
  | 'database'
  | 'file_storage'
  | 'webhook'
  | 'ai'
  | 'analytics'
  | 'payment'
  | 'productivity'
  | 'developer_tools'
  | 'triggers';

export interface IntegrationField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
}

export interface IntegrationNode extends BaseIntegration {
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'data_transform' | 'logic' | 'router' | 'iterator' | 'aggregator';
  fields: IntegrationField[];
  endpoints: IntegrationEndpoint[];
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  parameters: Record<string, ConfigField>;
  responseSchema?: Record<string, any>;
}

export interface ExecutionContext {
  workflowId: string;
  stepId: string;
  input: Record<string, any>;
  credentials: Record<string, string>;
  previousStepOutputs: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  logs: string[];
}