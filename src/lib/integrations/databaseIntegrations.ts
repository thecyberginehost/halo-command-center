import { IntegrationService, IntegrationNode } from '@/types/integrations';
import { Database, Plus, Search, Edit, Trash2, List, FileText } from 'lucide-react';

export const postgresqlService: IntegrationService = {
  id: 'postgresql',
  name: 'PostgreSQL',
  description: 'PostgreSQL database integration',
  category: 'database',
  icon: Database,
  color: '#336791',
  requiresAuth: true,
  authType: 'basic',
  configSchema: {},
  actions: [
    {
      id: 'create_record',
      name: 'Create Record',
      description: 'Insert a new record into a PostgreSQL table',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'data', label: 'Record Data (JSON)', type: 'textarea', required: true, placeholder: '{"name": "John", "email": "john@example.com"}' }
      ],
      endpoint: { id: 'create', name: 'Create Record', description: 'Insert record into PostgreSQL', method: 'POST', path: '/postgresql/records', parameters: {} }
    },
    {
      id: 'read_records',
      name: 'Read Records',
      description: 'Query records from a PostgreSQL table',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'where', label: 'WHERE Clause', type: 'text', required: false, placeholder: 'email = \'john@example.com\'' },
        { name: 'limit', label: 'Limit', type: 'number', required: false, defaultValue: 100 }
      ],
      endpoint: { id: 'read', name: 'Read Records', description: 'Query PostgreSQL records', method: 'GET', path: '/postgresql/records', parameters: {} }
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update an existing record in PostgreSQL',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'where', label: 'WHERE Clause', type: 'text', required: true, placeholder: 'id = 123' },
        { name: 'data', label: 'Update Data (JSON)', type: 'textarea', required: true, placeholder: '{"name": "John Updated"}' }
      ],
      endpoint: { id: 'update', name: 'Update Record', description: 'Update PostgreSQL record', method: 'PUT', path: '/postgresql/records', parameters: {} }
    },
    {
      id: 'delete_record',
      name: 'Delete Record',
      description: 'Delete a record from PostgreSQL',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'where', label: 'WHERE Clause', type: 'text', required: true, placeholder: 'id = 123' }
      ],
      endpoint: { id: 'delete', name: 'Delete Record', description: 'Delete PostgreSQL record', method: 'DELETE', path: '/postgresql/records', parameters: {} }
    },
    {
      id: 'execute_query',
      name: 'Execute Custom Query',
      description: 'Execute a custom SQL query',
      type: 'action',
      fields: [
        { name: 'query', label: 'SQL Query', type: 'textarea', required: true, placeholder: 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL \'1 day\'' }
      ],
      endpoint: { id: 'query', name: 'Execute Query', description: 'Execute custom SQL', method: 'POST', path: '/postgresql/query', parameters: {} }
    }
  ]
};

export const postgresqlCreateRecord: IntegrationNode = {
  ...postgresqlService,
  id: 'postgresql-create-record',
  name: 'PostgreSQL - Create Record',
  type: 'action',
  icon: Plus,
  serviceId: 'postgresql',
  actionId: 'create_record',
  fields: postgresqlService.actions[0].fields,
  endpoints: [postgresqlService.actions[0].endpoint]
};

export const postgresqlReadRecords: IntegrationNode = {
  ...postgresqlService,
  id: 'postgresql-read-records',
  name: 'PostgreSQL - Read Records',
  type: 'action',
  icon: Search,
  serviceId: 'postgresql',
  actionId: 'read_records',
  fields: postgresqlService.actions[1].fields,
  endpoints: [postgresqlService.actions[1].endpoint]
};

export const postgresqlUpdateRecord: IntegrationNode = {
  ...postgresqlService,
  id: 'postgresql-update-record',
  name: 'PostgreSQL - Update Record',
  type: 'action',
  icon: Edit,
  serviceId: 'postgresql',
  actionId: 'update_record',
  fields: postgresqlService.actions[2].fields,
  endpoints: [postgresqlService.actions[2].endpoint]
};

export const postgresqlDeleteRecord: IntegrationNode = {
  ...postgresqlService,
  id: 'postgresql-delete-record',
  name: 'PostgreSQL - Delete Record',
  type: 'action',
  icon: Trash2,
  serviceId: 'postgresql',
  actionId: 'delete_record',
  fields: postgresqlService.actions[3].fields,
  endpoints: [postgresqlService.actions[3].endpoint]
};

export const postgresqlExecuteQuery: IntegrationNode = {
  ...postgresqlService,
  id: 'postgresql-execute-query',
  name: 'PostgreSQL - Execute Query',
  type: 'action',
  icon: FileText,
  serviceId: 'postgresql',
  actionId: 'execute_query',
  fields: postgresqlService.actions[4].fields,
  endpoints: [postgresqlService.actions[4].endpoint]
};

export const mysqlService: IntegrationService = {
  id: 'mysql',
  name: 'MySQL',
  description: 'MySQL database integration',
  category: 'database',
  icon: Database,
  color: '#4479A1',
  requiresAuth: true,
  authType: 'basic',
  configSchema: {},
  actions: [
    {
      id: 'create_record',
      name: 'Create Record',
      description: 'Insert a new record into a MySQL table',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'data', label: 'Record Data (JSON)', type: 'textarea', required: true, placeholder: '{"name": "John", "email": "john@example.com"}' }
      ],
      endpoint: { id: 'create', name: 'Create Record', description: 'Insert record into MySQL', method: 'POST', path: '/mysql/records', parameters: {} }
    },
    {
      id: 'read_records',
      name: 'Read Records',
      description: 'Query records from a MySQL table',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'where', label: 'WHERE Clause', type: 'text', required: false, placeholder: 'email = \'john@example.com\'' },
        { name: 'limit', label: 'Limit', type: 'number', required: false, defaultValue: 100 }
      ],
      endpoint: { id: 'read', name: 'Read Records', description: 'Query MySQL records', method: 'GET', path: '/mysql/records', parameters: {} }
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update an existing record in MySQL',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'where', label: 'WHERE Clause', type: 'text', required: true, placeholder: 'id = 123' },
        { name: 'data', label: 'Update Data (JSON)', type: 'textarea', required: true, placeholder: '{"name": "John Updated"}' }
      ],
      endpoint: { id: 'update', name: 'Update Record', description: 'Update MySQL record', method: 'PUT', path: '/mysql/records', parameters: {} }
    },
    {
      id: 'delete_record',
      name: 'Delete Record',
      description: 'Delete a record from MySQL',
      type: 'action',
      fields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'where', label: 'WHERE Clause', type: 'text', required: true, placeholder: 'id = 123' }
      ],
      endpoint: { id: 'delete', name: 'Delete Record', description: 'Delete MySQL record', method: 'DELETE', path: '/mysql/records', parameters: {} }
    },
    {
      id: 'execute_query',
      name: 'Execute Custom Query',
      description: 'Execute a custom SQL query',
      type: 'action',
      fields: [
        { name: 'query', label: 'SQL Query', type: 'textarea', required: true, placeholder: 'SELECT * FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)' }
      ],
      endpoint: { id: 'query', name: 'Execute Query', description: 'Execute custom SQL', method: 'POST', path: '/mysql/query', parameters: {} }
    }
  ]
};

export const mysqlCreateRecord: IntegrationNode = {
  ...mysqlService,
  id: 'mysql-create-record',
  name: 'MySQL - Create Record',
  type: 'action',
  icon: Plus,
  serviceId: 'mysql',
  actionId: 'create_record',
  fields: mysqlService.actions[0].fields,
  endpoints: [mysqlService.actions[0].endpoint]
};

export const mysqlReadRecords: IntegrationNode = {
  ...mysqlService,
  id: 'mysql-read-records',
  name: 'MySQL - Read Records',
  type: 'action',
  icon: Search,
  serviceId: 'mysql',
  actionId: 'read_records',
  fields: mysqlService.actions[1].fields,
  endpoints: [mysqlService.actions[1].endpoint]
};

export const mysqlUpdateRecord: IntegrationNode = {
  ...mysqlService,
  id: 'mysql-update-record',
  name: 'MySQL - Update Record',
  type: 'action',
  icon: Edit,
  serviceId: 'mysql',
  actionId: 'update_record',
  fields: mysqlService.actions[2].fields,
  endpoints: [mysqlService.actions[2].endpoint]
};

export const mysqlDeleteRecord: IntegrationNode = {
  ...mysqlService,
  id: 'mysql-delete-record',
  name: 'MySQL - Delete Record',
  type: 'action',
  icon: Trash2,
  serviceId: 'mysql',
  actionId: 'delete_record',
  fields: mysqlService.actions[3].fields,
  endpoints: [mysqlService.actions[3].endpoint]
};

export const mysqlExecuteQuery: IntegrationNode = {
  ...mysqlService,
  id: 'mysql-execute-query',
  name: 'MySQL - Execute Query',
  type: 'action',
  icon: FileText,
  serviceId: 'mysql',
  actionId: 'execute_query',
  fields: mysqlService.actions[4].fields,
  endpoints: [mysqlService.actions[4].endpoint]
};

export const mongodbService: IntegrationService = {
  id: 'mongodb',
  name: 'MongoDB',
  description: 'MongoDB database integration',
  category: 'database',
  icon: Database,
  color: '#47A248',
  requiresAuth: true,
  authType: 'basic',
  configSchema: {},
  actions: [
    {
      id: 'create_document',
      name: 'Create Document',
      description: 'Insert a new document into a MongoDB collection',
      type: 'action',
      fields: [
        { name: 'collection', label: 'Collection Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'document', label: 'Document Data (JSON)', type: 'textarea', required: true, placeholder: '{"name": "John", "email": "john@example.com"}' }
      ],
      endpoint: { id: 'create', name: 'Create Document', description: 'Insert document into MongoDB', method: 'POST', path: '/mongodb/documents', parameters: {} }
    },
    {
      id: 'find_documents',
      name: 'Find Documents',
      description: 'Query documents from a MongoDB collection',
      type: 'action',
      fields: [
        { name: 'collection', label: 'Collection Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'query', label: 'Query (JSON)', type: 'textarea', required: false, placeholder: '{"email": "john@example.com"}' },
        { name: 'limit', label: 'Limit', type: 'number', required: false, defaultValue: 100 }
      ],
      endpoint: { id: 'find', name: 'Find Documents', description: 'Query MongoDB documents', method: 'GET', path: '/mongodb/documents', parameters: {} }
    },
    {
      id: 'update_document',
      name: 'Update Document',
      description: 'Update an existing document in MongoDB',
      type: 'action',
      fields: [
        { name: 'collection', label: 'Collection Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'query', label: 'Query (JSON)', type: 'textarea', required: true, placeholder: '{"_id": "ObjectId"}' },
        { name: 'update', label: 'Update Data (JSON)', type: 'textarea', required: true, placeholder: '{"$set": {"name": "John Updated"}}' }
      ],
      endpoint: { id: 'update', name: 'Update Document', description: 'Update MongoDB document', method: 'PUT', path: '/mongodb/documents', parameters: {} }
    },
    {
      id: 'delete_document',
      name: 'Delete Document',
      description: 'Delete a document from MongoDB',
      type: 'action',
      fields: [
        { name: 'collection', label: 'Collection Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'query', label: 'Query (JSON)', type: 'textarea', required: true, placeholder: '{"_id": "ObjectId"}' }
      ],
      endpoint: { id: 'delete', name: 'Delete Document', description: 'Delete MongoDB document', method: 'DELETE', path: '/mongodb/documents', parameters: {} }
    },
    {
      id: 'aggregate',
      name: 'Aggregate Documents',
      description: 'Run an aggregation pipeline on MongoDB collection',
      type: 'action',
      fields: [
        { name: 'collection', label: 'Collection Name', type: 'text', required: true, placeholder: 'users' },
        { name: 'pipeline', label: 'Aggregation Pipeline (JSON)', type: 'textarea', required: true, placeholder: '[{"$group": {"_id": "$status", "count": {"$sum": 1}}}]' }
      ],
      endpoint: { id: 'aggregate', name: 'Aggregate Documents', description: 'Run aggregation in MongoDB', method: 'POST', path: '/mongodb/aggregate', parameters: {} }
    }
  ]
};

export const mongodbCreateDocument: IntegrationNode = {
  ...mongodbService,
  id: 'mongodb-create-document',
  name: 'MongoDB - Create Document',
  type: 'action',
  icon: Plus,
  serviceId: 'mongodb',
  actionId: 'create_document',
  fields: mongodbService.actions[0].fields,
  endpoints: [mongodbService.actions[0].endpoint]
};

export const mongodbFindDocuments: IntegrationNode = {
  ...mongodbService,
  id: 'mongodb-find-documents',
  name: 'MongoDB - Find Documents',
  type: 'action',
  icon: Search,
  serviceId: 'mongodb',
  actionId: 'find_documents',
  fields: mongodbService.actions[1].fields,
  endpoints: [mongodbService.actions[1].endpoint]
};

export const mongodbUpdateDocument: IntegrationNode = {
  ...mongodbService,
  id: 'mongodb-update-document',
  name: 'MongoDB - Update Document',
  type: 'action',
  icon: Edit,
  serviceId: 'mongodb',
  actionId: 'update_document',
  fields: mongodbService.actions[2].fields,
  endpoints: [mongodbService.actions[2].endpoint]
};

export const mongodbDeleteDocument: IntegrationNode = {
  ...mongodbService,
  id: 'mongodb-delete-document',
  name: 'MongoDB - Delete Document',
  type: 'action',
  icon: Trash2,
  serviceId: 'mongodb',
  actionId: 'delete_document',
  fields: mongodbService.actions[3].fields,
  endpoints: [mongodbService.actions[3].endpoint]
};

export const mongodbAggregate: IntegrationNode = {
  ...mongodbService,
  id: 'mongodb-aggregate',
  name: 'MongoDB - Aggregate Documents',
  type: 'action',
  icon: List,
  serviceId: 'mongodb',
  actionId: 'aggregate',
  fields: mongodbService.actions[4].fields,
  endpoints: [mongodbService.actions[4].endpoint]
};

// Keep backward compatibility and Redis (simpler structure)
export const postgresqlIntegration: IntegrationNode = postgresqlCreateRecord;
export const mysqlIntegration: IntegrationNode = mysqlCreateRecord;
export const mongodbIntegration: IntegrationNode = mongodbCreateDocument;

export const redisIntegration: IntegrationNode = {
  id: 'redis-set-key',
  name: 'Redis - Set Key',
  description: 'Set a key-value pair in Redis',
  category: 'database',
  icon: Database,
  color: '#DC382D',
  type: 'action',
  requiresAuth: true,
  authType: 'basic',
  configSchema: {},
  fields: [
    { name: 'key', label: 'Key', type: 'text', required: true, placeholder: 'user:123' },
    { name: 'value', label: 'Value', type: 'text', required: true, placeholder: 'John Doe' },
    { name: 'ttl', label: 'TTL (seconds)', type: 'number', required: false, placeholder: '3600' }
  ],
  endpoints: [
    { id: 'set', name: 'Set Key', description: 'Set key-value in Redis', method: 'POST', path: '/redis/set', parameters: {} }
  ]
};
