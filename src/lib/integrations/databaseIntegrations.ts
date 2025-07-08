import { IntegrationNode } from '@/types/integrations';
import { Database, Server, Layers } from 'lucide-react';

export const postgresqlIntegration: IntegrationNode = {
  id: 'postgresql',
  name: 'PostgreSQL',
  description: 'Connect to PostgreSQL databases',
  category: 'database',
  icon: Database,
  color: '#336791',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  configSchema: {
    host: {
      type: 'text',
      label: 'Host',
      required: true
    },
    port: {
      type: 'number',
      label: 'Port',
      required: true
    },
    database: {
      type: 'text',
      label: 'Database Name',
      required: true
    },
    username: {
      type: 'text',
      label: 'Username',
      required: true
    },
    password: {
      type: 'password',
      label: 'Password',
      required: true
    },
    ssl_mode: {
      type: 'select',
      label: 'SSL Mode',
      required: true,
      options: [
        { label: 'Require', value: 'require' },
        { label: 'Prefer', value: 'prefer' },
        { label: 'Disable', value: 'disable' }
      ]
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Database Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Execute Query', value: 'query' },
        { label: 'Insert Record', value: 'insert' },
        { label: 'Update Record', value: 'update' },
        { label: 'Delete Record', value: 'delete' }
      ]
    },
    {
      name: 'query',
      label: 'SQL Query',
      type: 'textarea',
      required: true,
      placeholder: 'SELECT * FROM users WHERE id = $1',
      helpText: 'Use $1, $2, etc. for parameters'
    },
    {
      name: 'parameters',
      label: 'Query Parameters',
      type: 'textarea',
      required: false,
      placeholder: '[123, "example"]',
      helpText: 'JSON array of parameter values'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Query',
      description: 'Execute SQL query on PostgreSQL',
      method: 'POST',
      path: '/postgresql/execute',
      parameters: {
        query: {
          type: 'textarea',
          label: 'SQL Query',
          required: true
        },
        parameters: {
          type: 'textarea',
          label: 'Parameters',
          required: false
        }
      }
    }
  ]
};

export const mysqlIntegration: IntegrationNode = {
  id: 'mysql',
  name: 'MySQL',
  description: 'Connect to MySQL databases',
  category: 'database',
  icon: Database,
  color: '#4479A1',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  configSchema: {
    host: {
      type: 'text',
      label: 'Host',
      required: true
    },
    port: {
      type: 'number',
      label: 'Port',
      required: true
    },
    database: {
      type: 'text',
      label: 'Database Name',
      required: true
    },
    username: {
      type: 'text',
      label: 'Username',
      required: true
    },
    password: {
      type: 'password',
      label: 'Password',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Database Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Execute Query', value: 'query' },
        { label: 'Insert Record', value: 'insert' },
        { label: 'Update Record', value: 'update' },
        { label: 'Delete Record', value: 'delete' }
      ]
    },
    {
      name: 'query',
      label: 'SQL Query',
      type: 'textarea',
      required: true,
      placeholder: 'SELECT * FROM users WHERE id = ?',
      helpText: 'Use ? for parameters'
    },
    {
      name: 'parameters',
      label: 'Query Parameters',
      type: 'textarea',
      required: false,
      placeholder: '[123, "example"]',
      helpText: 'JSON array of parameter values'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Query',
      description: 'Execute SQL query on MySQL',
      method: 'POST',
      path: '/mysql/execute',
      parameters: {
        query: {
          type: 'textarea',
          label: 'SQL Query',
          required: true
        },
        parameters: {
          type: 'textarea',
          label: 'Parameters',
          required: false
        }
      }
    }
  ]
};

export const mongodbIntegration: IntegrationNode = {
  id: 'mongodb',
  name: 'MongoDB',
  description: 'Connect to MongoDB databases',
  category: 'database',
  icon: Layers,
  color: '#47A248',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  configSchema: {
    connection_string: {
      type: 'text',
      label: 'Connection String',
      required: true
    },
    database: {
      type: 'text',
      label: 'Database Name',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Database Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Find Documents', value: 'find' },
        { label: 'Insert Document', value: 'insert' },
        { label: 'Update Document', value: 'update' },
        { label: 'Delete Document', value: 'delete' },
        { label: 'Aggregate', value: 'aggregate' }
      ]
    },
    {
      name: 'collection',
      label: 'Collection Name',
      type: 'text',
      required: true,
      placeholder: 'users'
    },
    {
      name: 'query',
      label: 'Query/Filter',
      type: 'textarea',
      required: false,
      placeholder: '{"status": "active"}',
      helpText: 'MongoDB query object in JSON format'
    },
    {
      name: 'document',
      label: 'Document Data',
      type: 'textarea',
      required: false,
      placeholder: '{"name": "John", "email": "john@example.com"}',
      helpText: 'Document data for insert/update operations'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Operation',
      description: 'Execute MongoDB operation',
      method: 'POST',
      path: '/mongodb/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        collection: {
          type: 'text',
          label: 'Collection',
          required: true
        },
        query: {
          type: 'textarea',
          label: 'Query',
          required: false
        }
      }
    }
  ]
};

export const redisIntegration: IntegrationNode = {
  id: 'redis',
  name: 'Redis',
  description: 'Connect to Redis cache/queue',
  category: 'database',
  icon: Server,
  color: '#DC382D',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  configSchema: {
    host: {
      type: 'text',
      label: 'Host',
      required: true
    },
    port: {
      type: 'number',
      label: 'Port',
      required: true
    },
    password: {
      type: 'password',
      label: 'Password',
      required: false
    },
    database: {
      type: 'number',
      label: 'Database Number',
      required: false
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Redis Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Get Value', value: 'get' },
        { label: 'Set Value', value: 'set' },
        { label: 'Delete Key', value: 'del' },
        { label: 'Push to List', value: 'lpush' },
        { label: 'Pop from List', value: 'lpop' },
        { label: 'Add to Set', value: 'sadd' },
        { label: 'Get Set Members', value: 'smembers' }
      ]
    },
    {
      name: 'key',
      label: 'Key',
      type: 'text',
      required: true,
      placeholder: 'user:123:profile'
    },
    {
      name: 'value',
      label: 'Value',
      type: 'textarea',
      required: false,
      placeholder: 'Value to store',
      helpText: 'Required for set operations'
    },
    {
      name: 'expiry',
      label: 'Expiry (seconds)',
      type: 'number',
      required: false,
      helpText: 'TTL for the key (optional)'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Command',
      description: 'Execute Redis command',
      method: 'POST',
      path: '/redis/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        key: {
          type: 'text',
          label: 'Key',
          required: true
        },
        value: {
          type: 'text',
          label: 'Value',
          required: false
        }
      }
    }
  ]
};