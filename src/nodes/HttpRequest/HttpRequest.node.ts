import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const HttpRequestNode: HaloNodeDefinition = {
  displayName: 'HTTP Request',
  name: 'httpRequest',
  icon: 'httprequest.svg',
  group: ['transform'],
  version: 1,
  description: 'Makes an HTTP request and returns the response data',
  defaults: {
    name: 'HTTP Request',
    color: '#3B82F6',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Method',
      name: 'method',
      type: 'options',
      options: [
        { name: 'GET', value: 'GET' },
        { name: 'POST', value: 'POST' },
        { name: 'PUT', value: 'PUT' },
        { name: 'DELETE', value: 'DELETE' },
        { name: 'PATCH', value: 'PATCH' },
      ],
      default: 'GET',
      required: true,
      description: 'The HTTP method to use',
    },
    {
      displayName: 'URL',
      name: 'url',
      type: 'string',
      default: '',
      required: true,
      placeholder: 'https://api.example.com/data',
      description: 'The URL to make the request to',
    },
    {
      displayName: 'Headers',
      name: 'headers',
      type: 'json',
      default: '{}',
      description: 'Headers to send with the request',
      typeOptions: {
        rows: 4,
      },
    },
    {
      displayName: 'Body',
      name: 'body',
      type: 'json',
      default: '{}',
      description: 'Request body (for POST, PUT, PATCH)',
      typeOptions: {
        rows: 6,
      },
    },
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: HaloNodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const method = context.getNodeParameter('method', i) as string;
      const url = context.getNodeParameter('url', i) as string;
      const headers = context.getNodeParameter('headers', i) as string;
      const body = context.getNodeParameter('body', i) as string;

      try {
        const requestOptions: any = {
          method,
          url,
          headers: headers ? JSON.parse(headers) : {},
        };

        if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
          requestOptions.body = body;
          requestOptions.headers['Content-Type'] = 'application/json';
        }

        const response = await context.helpers.request(requestOptions);

        returnData.push({
          json: {
            statusCode: response.statusCode || 200,
            headers: response.headers || {},
            body: response.body || response,
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            error: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500,
          },
        });
      }
    }

    return [returnData];
  },
};