import { IntegrationNode } from '@/types/integrations';
import { GitBranch, RepeatIcon, Combine } from 'lucide-react';

export const routerIntegration: IntegrationNode = {
  id: 'router',
  name: 'Router',
  description: 'Route data to different paths based on conditions',
  category: 'webhook',
  icon: GitBranch,
  color: '#8B5CF6',
  requiresAuth: false,
  type: 'router',
  configSchema: {
    routes: {
      type: 'textarea',
      label: 'Route Conditions',
      required: true
    }
  },
  fields: [
    {
      name: 'route_type',
      label: 'Route Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Conditional Routes', value: 'conditional' },
        { label: 'Split by Field', value: 'field_split' },
        { label: 'Round Robin', value: 'round_robin' },
        { label: 'Weighted Distribution', value: 'weighted' }
      ]
    },
    {
      name: 'routes',
      label: 'Route Definitions',
      type: 'textarea',
      required: true,
      placeholder: '[{"condition": "data.amount > 100", "path": "high_value"}, {"condition": "data.amount <= 100", "path": "low_value"}]',
      helpText: 'JSON array defining route conditions and paths'
    },
    {
      name: 'default_route',
      label: 'Default Route',
      type: 'text',
      required: false,
      placeholder: 'default_path',
      helpText: 'Fallback route when no conditions match'
    }
  ],
  endpoints: [
    {
      id: 'route',
      name: 'Route Data',
      description: 'Route incoming data to appropriate paths',
      method: 'POST',
      path: '/router/route',
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

export const iteratorIntegration: IntegrationNode = {
  id: 'iterator',
  name: 'Iterator',
  description: 'Iterate over arrays and process each item',
  category: 'webhook',
  icon: RepeatIcon,
  color: '#F59E0B',
  requiresAuth: false,
  type: 'iterator',
  configSchema: {
    array_path: {
      type: 'text',
      label: 'Array Path',
      required: true
    },
    batch_size: {
      type: 'number',
      label: 'Batch Size',
      required: false
    }
  },
  fields: [
    {
      name: 'array_path',
      label: 'Array Field Path',
      type: 'text',
      required: true,
      placeholder: 'data.items',
      helpText: 'Path to the array field to iterate over'
    },
    {
      name: 'batch_size',
      label: 'Batch Size',
      type: 'number',
      required: false,
      defaultValue: 1,
      helpText: 'Number of items to process at once'
    },
    {
      name: 'max_iterations',
      label: 'Max Iterations',
      type: 'number',
      required: false,
      defaultValue: 1000,
      helpText: 'Safety limit to prevent infinite loops'
    },
    {
      name: 'preserve_order',
      label: 'Preserve Order',
      type: 'boolean',
      required: false,
      defaultValue: true,
      helpText: 'Maintain original array order in output'
    }
  ],
  endpoints: [
    {
      id: 'iterate',
      name: 'Iterate Array',
      description: 'Process array items one by one',
      method: 'POST',
      path: '/iterator/process',
      parameters: {
        array_data: {
          type: 'textarea',
          label: 'Array Data',
          required: true
        }
      }
    }
  ]
};

export const aggregatorIntegration: IntegrationNode = {
  id: 'aggregator',
  name: 'Aggregator',
  description: 'Combine multiple data inputs into a single output',
  category: 'webhook',
  icon: Combine,
  color: '#06B6D4',
  requiresAuth: false,
  type: 'aggregator',
  configSchema: {
    aggregation_type: {
      type: 'select',
      label: 'Aggregation Type',
      required: true,
      options: [
        { label: 'Array Aggregator', value: 'array' },
        { label: 'Text Aggregator', value: 'text' },
        { label: 'Numeric Aggregator', value: 'numeric' },
        { label: 'Table Aggregator', value: 'table' }
      ]
    }
  },
  fields: [
    {
      name: 'aggregation_type',
      label: 'Aggregation Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Array Aggregator', value: 'array' },
        { label: 'Text Aggregator', value: 'text' },
        { label: 'Numeric Aggregator', value: 'numeric' },
        { label: 'Table Aggregator', value: 'table' }
      ]
    },
    {
      name: 'source_field',
      label: 'Source Field',
      type: 'text',
      required: true,
      placeholder: 'data.value',
      helpText: 'Field to aggregate from each input'
    },
    {
      name: 'separator',
      label: 'Separator',
      type: 'text',
      required: false,
      defaultValue: ',',
      helpText: 'Separator for text aggregation'
    },
    {
      name: 'operation',
      label: 'Numeric Operation',
      type: 'select',
      required: false,
      options: [
        { label: 'Sum', value: 'sum' },
        { label: 'Average', value: 'avg' },
        { label: 'Min', value: 'min' },
        { label: 'Max', value: 'max' },
        { label: 'Count', value: 'count' }
      ]
    },
    {
      name: 'timeout_seconds',
      label: 'Timeout (seconds)',
      type: 'number',
      required: false,
      defaultValue: 60,
      helpText: 'How long to wait for all inputs'
    }
  ],
  endpoints: [
    {
      id: 'aggregate',
      name: 'Aggregate Data',
      description: 'Combine multiple inputs into single output',
      method: 'POST',
      path: '/aggregator/combine',
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