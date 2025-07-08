import { IntegrationNode } from '@/types/integrations';
import { GitBranch, Clock, RepeatIcon, Timer, AlertTriangle } from 'lucide-react';

export const conditionIntegration: IntegrationNode = {
  id: 'condition',
  name: 'Condition',
  description: 'Add conditional logic to your workflow',
  category: 'webhook',
  icon: GitBranch,
  color: '#10B981',
  requiresAuth: false,
  type: 'condition',
  configSchema: {
    condition_type: {
      type: 'select',
      label: 'Condition Type',
      required: true,
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Contains', value: 'contains' },
        { label: 'Greater Than', value: 'greater_than' },
        { label: 'Less Than', value: 'less_than' },
        { label: 'Exists', value: 'exists' },
        { label: 'Is Empty', value: 'is_empty' }
      ]
    },
    field_path: {
      type: 'text',
      label: 'Field Path',
      placeholder: 'e.g., data.email, response.status',
      required: true
    },
    comparison_value: {
      type: 'text',
      label: 'Value to Compare',
      placeholder: 'Value to compare against',
      required: false
    }
  },
  fields: [
    {
      name: 'condition_type',
      label: 'Condition Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Contains', value: 'contains' },
        { label: 'Greater Than', value: 'greater_than' },
        { label: 'Less Than', value: 'less_than' },
        { label: 'Exists', value: 'exists' },
        { label: 'Is Empty', value: 'is_empty' }
      ]
    },
    {
      name: 'field_path',
      label: 'Field Path',
      type: 'text',
      required: true,
      placeholder: 'e.g., data.email, response.status',
      helpText: 'The path to the field you want to check'
    },
    {
      name: 'comparison_value',
      label: 'Comparison Value',
      type: 'text',
      required: false,
      placeholder: 'Value to compare against',
      helpText: 'Leave empty for "exists" and "is_empty" conditions'
    }
  ],
  endpoints: [
    {
      id: 'evaluate',
      name: 'Evaluate Condition',
      description: 'Evaluate the specified condition',
      method: 'POST',
      path: '/condition/evaluate',
      parameters: {
        input_data: {
          type: 'textarea',
          label: 'Input Data',
          required: true
        }
      }
    }
  ]
};

export const delayIntegration: IntegrationNode = {
  id: 'delay',
  name: 'Delay',
  description: 'Add a time delay to your workflow',
  category: 'webhook',
  icon: Clock,
  color: '#6B7280',
  requiresAuth: false,
  type: 'delay',
  configSchema: {
    delay_type: {
      type: 'select',
      label: 'Delay Type',
      required: true,
      options: [
        { label: 'Fixed Delay', value: 'fixed' },
        { label: 'Dynamic Delay', value: 'dynamic' }
      ]
    },
    duration: {
      type: 'number',
      label: 'Duration (seconds)',
      required: true
    },
    duration_field: {
      type: 'text',
      label: 'Duration Field Path',
      required: false
    }
  },
  fields: [
    {
      name: 'delay_type',
      label: 'Delay Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Fixed Delay', value: 'fixed' },
        { label: 'Dynamic Delay', value: 'dynamic' }
      ]
    },
    {
      name: 'duration',
      label: 'Duration (seconds)',
      type: 'number',
      required: true,
      defaultValue: 60,
      helpText: 'How long to wait before continuing'
    },
    {
      name: 'duration_field',
      label: 'Duration Field Path',
      type: 'text',
      required: false,
      placeholder: 'e.g., data.delay_seconds',
      helpText: 'For dynamic delays, specify field containing delay duration'
    }
  ],
  endpoints: [
    {
      id: 'delay',
      name: 'Execute Delay',
      description: 'Wait for the specified duration',
      method: 'POST',
      path: '/delay/execute',
      parameters: {
        delay_seconds: {
          type: 'number',
          label: 'Delay Seconds',
          required: true
        }
      }
    }
  ]
};

export const loopIntegration: IntegrationNode = {
  id: 'loop',
  name: 'Loop',
  description: 'Repeat actions for each item in a list',
  category: 'webhook',
  icon: RepeatIcon,
  color: '#8B5CF6',
  requiresAuth: false,
  type: 'logic',
  configSchema: {
    loop_type: {
      type: 'select',
      label: 'Loop Type',
      required: true,
      options: [
        { label: 'For Each Item', value: 'foreach' },
        { label: 'While Condition', value: 'while' },
        { label: 'Fixed Count', value: 'count' }
      ]
    },
    array_path: {
      type: 'text',
      label: 'Array Field Path',
      required: false
    },
    max_iterations: {
      type: 'number',
      label: 'Max Iterations',
      required: true
    }
  },
  fields: [
    {
      name: 'loop_type',
      label: 'Loop Type',
      type: 'select',
      required: true,
      options: [
        { label: 'For Each Item', value: 'foreach' },
        { label: 'While Condition', value: 'while' },
        { label: 'Fixed Count', value: 'count' }
      ]
    },
    {
      name: 'array_path',
      label: 'Array Field Path',
      type: 'text',
      required: false,
      placeholder: 'e.g., data.items, response.users',
      helpText: 'Path to array for "for each" loops'
    },
    {
      name: 'max_iterations',
      label: 'Maximum Iterations',
      type: 'number',
      required: true,
      defaultValue: 100,
      helpText: 'Safety limit to prevent infinite loops'
    }
  ],
  endpoints: [
    {
      id: 'iterate',
      name: 'Execute Loop',
      description: 'Process items in a loop',
      method: 'POST',
      path: '/loop/execute',
      parameters: {
        items: {
          type: 'textarea',
          label: 'Items to Process',
          required: true
        }
      }
    }
  ]
};

export const errorHandlerIntegration: IntegrationNode = {
  id: 'error_handler',
  name: 'Error Handler',
  description: 'Handle errors and exceptions in your workflow',
  category: 'webhook',
  icon: AlertTriangle,
  color: '#EF4444',
  requiresAuth: false,
  type: 'logic',
  configSchema: {
    error_action: {
      type: 'select',
      label: 'Error Action',
      required: true,
      options: [
        { label: 'Continue Workflow', value: 'continue' },
        { label: 'Stop Workflow', value: 'stop' },
        { label: 'Retry Step', value: 'retry' },
        { label: 'Custom Response', value: 'custom' }
      ]
    },
    retry_count: {
      type: 'number',
      label: 'Retry Count',
      required: false
    },
    retry_delay: {
      type: 'number',
      label: 'Retry Delay (seconds)',
      required: false
    }
  },
  fields: [
    {
      name: 'error_action',
      label: 'Error Action',
      type: 'select',
      required: true,
      options: [
        { label: 'Continue Workflow', value: 'continue' },
        { label: 'Stop Workflow', value: 'stop' },
        { label: 'Retry Step', value: 'retry' },
        { label: 'Custom Response', value: 'custom' }
      ]
    },
    {
      name: 'retry_count',
      label: 'Retry Count',
      type: 'number',
      required: false,
      defaultValue: 3,
      helpText: 'Number of times to retry failed step'
    },
    {
      name: 'retry_delay',
      label: 'Retry Delay (seconds)',
      type: 'number',
      required: false,
      defaultValue: 5,
      helpText: 'Delay between retry attempts'
    }
  ],
  endpoints: [
    {
      id: 'handle',
      name: 'Handle Error',
      description: 'Process workflow errors',
      method: 'POST',
      path: '/error/handle',
      parameters: {
        error_details: {
          type: 'textarea',
          label: 'Error Details',
          required: true
        }
      }
    }
  ]
};