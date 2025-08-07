import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const ConditionNode: HaloNodeDefinition = {
  displayName: 'Condition',
  name: 'condition',
  icon: 'condition.svg',
  group: ['logic'],
  version: 1,
  description: 'Route workflow based on conditions (if/else logic)',
  defaults: {
    name: 'Condition',
    color: '#F59E0B',
  },
  inputs: ['main'],
  outputs: ['true', 'false'],
  properties: [
    {
      displayName: 'Field Name',
      name: 'field',
      type: 'string',
      default: '',
      required: true,
      description: 'Field name from previous node (e.g., email, status)',
      placeholder: 'email'
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: 'equal',
      required: true,
      options: [
        { name: 'Equal', value: 'equal' },
        { name: 'Not Equal', value: 'notEqual' },
        { name: 'Contains', value: 'contains' },
        { name: 'Not Contains', value: 'notContains' },
        { name: 'Greater Than', value: 'greaterThan' },
        { name: 'Less Than', value: 'lessThan' },
        { name: 'Is Empty', value: 'isEmpty' },
        { name: 'Is Not Empty', value: 'isNotEmpty' },
        { name: 'Starts With', value: 'startsWith' },
        { name: 'Ends With', value: 'endsWith' }
      ]
    },
    {
      displayName: 'Value',
      name: 'value',
      type: 'string',
      default: '',
      required: false,
      description: 'Value to compare against',
      placeholder: 'Expected value'
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const field = context.getNodeParameter('field', 0) as string;
    const operation = context.getNodeParameter('operation', 0) as string;
    const value = context.getNodeParameter('value', 0) as string;
    
    const inputData = context.getInputData();
    const itemData = inputData[0]?.json || {};

    try {
      const fieldValue = itemData[field];
      let conditionResult = false;
      
      switch (operation) {
        case 'equal':
          conditionResult = String(fieldValue) === String(value);
          break;
        case 'notEqual':
          conditionResult = String(fieldValue) !== String(value);
          break;
        case 'contains':
          conditionResult = String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
          break;
        case 'notContains':
          conditionResult = !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
          break;
        case 'greaterThan':
          conditionResult = Number(fieldValue) > Number(value);
          break;
        case 'lessThan':
          conditionResult = Number(fieldValue) < Number(value);
          break;
        case 'isEmpty':
          conditionResult = !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
          break;
        case 'isNotEmpty':
          conditionResult = fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
          break;
        case 'startsWith':
          conditionResult = String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
          break;
        case 'endsWith':
          conditionResult = String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
          break;
      }

      const result = {
        field,
        operation,
        value,
        fieldValue,
        conditionResult,
        timestamp: new Date().toISOString(),
        inputData: itemData
      };

      console.log('Condition evaluation:', result);

      // Return data to appropriate output
      if (conditionResult) {
        // TRUE output (index 0)
        return [[{ json: { ...itemData, ...result, conditionPassed: true } }], []];
      } else {
        // FALSE output (index 1)
        return [[], [{ json: { ...itemData, ...result, conditionPassed: false } }]];
      }
    } catch (error) {
      throw new Error(`Failed to evaluate condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};