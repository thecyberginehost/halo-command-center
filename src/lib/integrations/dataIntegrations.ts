import { IntegrationNode } from '@/types/integrations';
import { Database, Filter, Shuffle, FileText, Calculator, Hash } from 'lucide-react';

export const dataTransformIntegration: IntegrationNode = {
  id: 'data_transform',
  name: 'Data Transform',
  description: 'Transform and manipulate data in your workflow',
  category: 'database',
  icon: Shuffle,
  color: '#3B82F6',
  requiresAuth: false,
  type: 'data_transform',
  configSchema: {
    transform_type: {
      type: 'select',
      label: 'Transform Type',
      required: true,
      options: [
        { label: 'Map Fields', value: 'map' },
        { label: 'Filter Data', value: 'filter' },
        { label: 'Sort Data', value: 'sort' },
        { label: 'Group Data', value: 'group' },
        { label: 'Calculate Values', value: 'calculate' },
        { label: 'Format Data', value: 'format' }
      ]
    },
    field_mappings: {
      type: 'textarea',
      label: 'Field Mappings (JSON)',
      required: false
    }
  },
  fields: [
    {
      name: 'transform_type',
      label: 'Transform Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Map Fields', value: 'map' },
        { label: 'Filter Data', value: 'filter' },
        { label: 'Sort Data', value: 'sort' },
        { label: 'Group Data', value: 'group' },
        { label: 'Calculate Values', value: 'calculate' },
        { label: 'Format Data', value: 'format' }
      ]
    },
    {
      name: 'field_mappings',
      label: 'Field Mappings',
      type: 'textarea',
      required: false,
      placeholder: '{"old_field": "new_field", "user.name": "customer_name"}',
      helpText: 'JSON object mapping source fields to target fields'
    },
    {
      name: 'filter_expression',
      label: 'Filter Expression',
      type: 'text',
      required: false,
      placeholder: 'status === "active" && age > 18',
      helpText: 'JavaScript expression for filtering data'
    }
  ],
  endpoints: [
    {
      id: 'transform',
      name: 'Transform Data',
      description: 'Apply data transformations',
      method: 'POST',
      path: '/data/transform',
      parameters: {
        input_data: {
          type: 'textarea',
          label: 'Input Data',
          required: true
        },
        transform_config: {
          type: 'textarea',
          label: 'Transform Configuration',
          required: true
        }
      }
    }
  ]
};

export const dataValidationIntegration: IntegrationNode = {
  id: 'data_validation',
  name: 'Data Validation',
  description: 'Validate data against schemas and rules',
  category: 'database',
  icon: Filter,
  color: '#059669',
  requiresAuth: false,
  type: 'data_transform',
  configSchema: {
    validation_type: {
      type: 'select',
      label: 'Validation Type',
      required: true,
      options: [
        { label: 'JSON Schema', value: 'json_schema' },
        { label: 'Field Rules', value: 'field_rules' },
        { label: 'Custom Validation', value: 'custom' }
      ]
    },
    schema: {
      type: 'textarea',
      label: 'Validation Schema',
      required: true
    }
  },
  fields: [
    {
      name: 'validation_type',
      label: 'Validation Type',
      type: 'select',
      required: true,
      options: [
        { label: 'JSON Schema', value: 'json_schema' },
        { label: 'Field Rules', value: 'field_rules' },
        { label: 'Custom Validation', value: 'custom' }
      ]
    },
    {
      name: 'schema',
      label: 'Validation Schema',
      type: 'textarea',
      required: true,
      placeholder: '{"type": "object", "properties": {"email": {"type": "string", "format": "email"}}}',
      helpText: 'JSON schema or validation rules'
    },
    {
      name: 'required_fields',
      label: 'Required Fields',
      type: 'text',
      required: false,
      placeholder: 'email, name, phone',
      helpText: 'Comma-separated list of required fields'
    }
  ],
  endpoints: [
    {
      id: 'validate',
      name: 'Validate Data',
      description: 'Validate data against rules',
      method: 'POST',
      path: '/data/validate',
      parameters: {
        input_data: {
          type: 'textarea',
          label: 'Data to Validate',
          required: true
        },
        validation_schema: {
          type: 'textarea',
          label: 'Validation Schema',
          required: true
        }
      }
    }
  ]
};

export const dataStorageIntegration: IntegrationNode = {
  id: 'data_storage',
  name: 'Data Storage',
  description: 'Store and retrieve data in workflow context',
  category: 'database',
  icon: Database,
  color: '#7C3AED',
  requiresAuth: false,
  type: 'data_transform',
  configSchema: {
    storage_type: {
      type: 'select',
      label: 'Storage Type',
      required: true,
      options: [
        { label: 'Workflow Variable', value: 'variable' },
        { label: 'Temporary Storage', value: 'temp' },
        { label: 'Persistent Storage', value: 'persistent' }
      ]
    },
    variable_name: {
      type: 'text',
      label: 'Variable Name',
      required: true
    }
  },
  fields: [
    {
      name: 'storage_type',
      label: 'Storage Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Workflow Variable', value: 'variable' },
        { label: 'Temporary Storage', value: 'temp' },
        { label: 'Persistent Storage', value: 'persistent' }
      ]
    },
    {
      name: 'variable_name',
      label: 'Variable Name',
      type: 'text',
      required: true,
      placeholder: 'customer_data',
      helpText: 'Name for storing/retrieving the data'
    },
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Store Data', value: 'store' },
        { label: 'Retrieve Data', value: 'retrieve' },
        { label: 'Delete Data', value: 'delete' }
      ]
    }
  ],
  endpoints: [
    {
      id: 'store',
      name: 'Store Data',
      description: 'Store data for later use',
      method: 'POST',
      path: '/data/store',
      parameters: {
        key: {
          type: 'text',
          label: 'Storage Key',
          required: true
        },
        value: {
          type: 'textarea',
          label: 'Data to Store',
          required: true
        }
      }
    }
  ]
};

export const jsonProcessorIntegration: IntegrationNode = {
  id: 'json_processor',
  name: 'JSON Processor',
  description: 'Parse, manipulate, and generate JSON data',
  category: 'database',
  icon: FileText,
  color: '#F59E0B',
  requiresAuth: false,
  type: 'data_transform',
  configSchema: {
    operation: {
      type: 'select',
      label: 'JSON Operation',
      required: true,
      options: [
        { label: 'Parse JSON', value: 'parse' },
        { label: 'Stringify JSON', value: 'stringify' },
        { label: 'Extract Value', value: 'extract' },
        { label: 'Merge Objects', value: 'merge' },
        { label: 'Remove Fields', value: 'remove' }
      ]
    },
    json_path: {
      type: 'text',
      label: 'JSON Path',
      required: false
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'JSON Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Parse JSON', value: 'parse' },
        { label: 'Stringify JSON', value: 'stringify' },
        { label: 'Extract Value', value: 'extract' },
        { label: 'Merge Objects', value: 'merge' },
        { label: 'Remove Fields', value: 'remove' }
      ]
    },
    {
      name: 'json_path',
      label: 'JSON Path',
      type: 'text',
      required: false,
      placeholder: '$.users[0].email',
      helpText: 'JSONPath expression for extracting specific values'
    },
    {
      name: 'fields_to_remove',
      label: 'Fields to Remove',
      type: 'text',
      required: false,
      placeholder: 'password, secret, internal_id',
      helpText: 'Comma-separated list of fields to remove from JSON'
    }
  ],
  endpoints: [
    {
      id: 'process',
      name: 'Process JSON',
      description: 'Perform JSON operations',
      method: 'POST',
      path: '/json/process',
      parameters: {
        input_json: {
          type: 'textarea',
          label: 'Input JSON',
          required: true
        },
        operation_config: {
          type: 'textarea',
          label: 'Operation Config',
          required: true
        }
      }
    }
  ]
};

export const calculatorIntegration: IntegrationNode = {
  id: 'calculator',
  name: 'Calculator',
  description: 'Perform mathematical calculations and operations',
  category: 'database',
  icon: Calculator,
  color: '#6366F1',
  requiresAuth: false,
  type: 'data_transform',
  configSchema: {
    operation: {
      type: 'select',
      label: 'Math Operation',
      required: true,
      options: [
        { label: 'Add', value: 'add' },
        { label: 'Subtract', value: 'subtract' },
        { label: 'Multiply', value: 'multiply' },
        { label: 'Divide', value: 'divide' },
        { label: 'Calculate Sum', value: 'sum' },
        { label: 'Calculate Average', value: 'average' },
        { label: 'Find Maximum', value: 'max' },
        { label: 'Find Minimum', value: 'min' }
      ]
    },
    expression: {
      type: 'text',
      label: 'Math Expression',
      required: false
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Math Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Add', value: 'add' },
        { label: 'Subtract', value: 'subtract' },
        { label: 'Multiply', value: 'multiply' },
        { label: 'Divide', value: 'divide' },
        { label: 'Calculate Sum', value: 'sum' },
        { label: 'Calculate Average', value: 'average' },
        { label: 'Find Maximum', value: 'max' },
        { label: 'Find Minimum', value: 'min' }
      ]
    },
    {
      name: 'expression',
      label: 'Math Expression',
      type: 'text',
      required: false,
      placeholder: '(price * quantity) * (1 + tax_rate)',
      helpText: 'Mathematical expression using field names'
    },
    {
      name: 'number_array_path',
      label: 'Number Array Path',
      type: 'text',
      required: false,
      placeholder: 'data.prices',
      helpText: 'Path to array of numbers for sum/average/min/max operations'
    }
  ],
  endpoints: [
    {
      id: 'calculate',
      name: 'Calculate',
      description: 'Perform mathematical calculations',
      method: 'POST',
      path: '/math/calculate',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        values: {
          type: 'textarea',
          label: 'Input Values',
          required: true
        }
      }
    }
  ]
};