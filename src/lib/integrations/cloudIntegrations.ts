import { IntegrationNode } from '@/types/integrations';
import { Cloud, Server, Database, Shield, Monitor, Zap, Settings, Lock } from 'lucide-react';

// AWS Integrations
export const awsEC2CreateInstance: IntegrationNode = {
  id: 'aws_ec2_create_instance',
  name: 'Create EC2 Instance',
  description: 'Launch a new EC2 instance on AWS',
  category: 'developer_tools',
  icon: Server,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'instance_type', label: 'Instance Type', type: 'select', required: true, options: [
      { label: 't2.micro', value: 't2.micro' },
      { label: 't2.small', value: 't2.small' },
      { label: 't3.medium', value: 't3.medium' }
    ]},
    { name: 'ami_id', label: 'AMI ID', type: 'text', required: true },
    { name: 'key_name', label: 'Key Pair Name', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    access_key: { type: 'text', label: 'Access Key ID', required: true },
    secret_key: { type: 'password', label: 'Secret Access Key', required: true },
    region: { type: 'text', label: 'AWS Region', required: true, placeholder: 'us-east-1' }
  }
};

export const awsLambdaInvoke: IntegrationNode = {
  id: 'aws_lambda_invoke',
  name: 'Invoke Lambda Function',
  description: 'Invoke an AWS Lambda function',
  category: 'developer_tools',
  icon: Zap,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'function_name', label: 'Function Name', type: 'text', required: true },
    { name: 'payload', label: 'Payload (JSON)', type: 'textarea', required: false },
    { name: 'invocation_type', label: 'Invocation Type', type: 'select', required: true, options: [
      { label: 'Synchronous', value: 'RequestResponse' },
      { label: 'Asynchronous', value: 'Event' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    access_key: { type: 'text', label: 'Access Key ID', required: true },
    secret_key: { type: 'password', label: 'Secret Access Key', required: true },
    region: { type: 'text', label: 'AWS Region', required: true }
  }
};

export const awsRDSSnapshot: IntegrationNode = {
  id: 'aws_rds_snapshot',
  name: 'Create RDS Snapshot',
  description: 'Create a snapshot of an RDS database',
  category: 'database',
  icon: Database,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'db_instance_identifier', label: 'DB Instance ID', type: 'text', required: true },
    { name: 'db_snapshot_identifier', label: 'Snapshot ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    access_key: { type: 'text', label: 'Access Key ID', required: true },
    secret_key: { type: 'password', label: 'Secret Access Key', required: true },
    region: { type: 'text', label: 'AWS Region', required: true }
  }
};

// Google Cloud Integrations
export const gcpComputeCreateInstance: IntegrationNode = {
  id: 'gcp_compute_create_instance',
  name: 'Create Compute Instance',
  description: 'Create a new Compute Engine instance',
  category: 'developer_tools',
  icon: Server,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'instance_name', label: 'Instance Name', type: 'text', required: true },
    { name: 'machine_type', label: 'Machine Type', type: 'text', required: true, placeholder: 'e2-medium' },
    { name: 'zone', label: 'Zone', type: 'text', required: true, placeholder: 'us-central1-a' }
  ],
  endpoints: [],
  configSchema: {
    service_account_key: { type: 'textarea', label: 'Service Account Key (JSON)', required: true },
    project_id: { type: 'text', label: 'Project ID', required: true }
  }
};

export const gcpCloudFunctionDeploy: IntegrationNode = {
  id: 'gcp_cloud_function_deploy',
  name: 'Deploy Cloud Function',
  description: 'Deploy a new Google Cloud Function',
  category: 'developer_tools',
  icon: Zap,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'function_name', label: 'Function Name', type: 'text', required: true },
    { name: 'source_archive_url', label: 'Source Archive URL', type: 'text', required: true },
    { name: 'entry_point', label: 'Entry Point', type: 'text', required: true },
    { name: 'runtime', label: 'Runtime', type: 'select', required: true, options: [
      { label: 'Node.js 18', value: 'nodejs18' },
      { label: 'Python 3.9', value: 'python39' },
      { label: 'Go 1.19', value: 'go119' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    service_account_key: { type: 'textarea', label: 'Service Account Key (JSON)', required: true },
    project_id: { type: 'text', label: 'Project ID', required: true }
  }
};

export const gcpBigQueryQuery: IntegrationNode = {
  id: 'gcp_bigquery_query',
  name: 'Execute BigQuery',
  description: 'Execute a SQL query in BigQuery',
  category: 'database',
  icon: Database,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'query', label: 'SQL Query', type: 'textarea', required: true },
    { name: 'dataset_id', label: 'Dataset ID', type: 'text', required: false },
    { name: 'use_legacy_sql', label: 'Use Legacy SQL', type: 'boolean', required: false }
  ],
  endpoints: [],
  configSchema: {
    service_account_key: { type: 'textarea', label: 'Service Account Key (JSON)', required: true },
    project_id: { type: 'text', label: 'Project ID', required: true }
  }
};

// Microsoft Azure Integrations
export const azureVMCreate: IntegrationNode = {
  id: 'azure_vm_create',
  name: 'Create Virtual Machine',
  description: 'Create a new Azure Virtual Machine',
  category: 'developer_tools',
  icon: Server,
  color: '#0078D4',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'vm_name', label: 'VM Name', type: 'text', required: true },
    { name: 'vm_size', label: 'VM Size', type: 'select', required: true, options: [
      { label: 'Standard_B1s', value: 'Standard_B1s' },
      { label: 'Standard_B2s', value: 'Standard_B2s' },
      { label: 'Standard_D2s_v3', value: 'Standard_D2s_v3' }
    ]},
    { name: 'resource_group', label: 'Resource Group', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'East US' }
  ],
  endpoints: [],
  configSchema: {
    subscription_id: { type: 'text', label: 'Subscription ID', required: true },
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true },
    tenant_id: { type: 'text', label: 'Tenant ID', required: true }
  }
};

export const azureFunctionDeploy: IntegrationNode = {
  id: 'azure_function_deploy',
  name: 'Deploy Azure Function',
  description: 'Deploy a new Azure Function',
  category: 'developer_tools',
  icon: Zap,
  color: '#0078D4',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'function_app_name', label: 'Function App Name', type: 'text', required: true },
    { name: 'function_name', label: 'Function Name', type: 'text', required: true },
    { name: 'runtime', label: 'Runtime Stack', type: 'select', required: true, options: [
      { label: 'Node.js', value: 'node' },
      { label: 'Python', value: 'python' },
      { label: 'C#', value: 'dotnet' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    subscription_id: { type: 'text', label: 'Subscription ID', required: true },
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

export const azureSQLQuery: IntegrationNode = {
  id: 'azure_sql_query',
  name: 'Execute SQL Query',
  description: 'Execute a query on Azure SQL Database',
  category: 'database',
  icon: Database,
  color: '#0078D4',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  fields: [
    { name: 'query', label: 'SQL Query', type: 'textarea', required: true },
    { name: 'database', label: 'Database Name', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    server: { type: 'text', label: 'Server Name', required: true },
    username: { type: 'text', label: 'Username', required: true },
    password: { type: 'password', label: 'Password', required: true }
  }
};

// DigitalOcean Integrations
export const digitaloceanDropletCreate: IntegrationNode = {
  id: 'digitalocean_droplet_create',
  name: 'Create Droplet',
  description: 'Create a new DigitalOcean Droplet',
  category: 'developer_tools',
  icon: Server,
  color: '#0080FF',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'name', label: 'Droplet Name', type: 'text', required: true },
    { name: 'size', label: 'Size', type: 'select', required: true, options: [
      { label: 's-1vcpu-1gb', value: 's-1vcpu-1gb' },
      { label: 's-1vcpu-2gb', value: 's-1vcpu-2gb' },
      { label: 's-2vcpu-2gb', value: 's-2vcpu-2gb' }
    ]},
    { name: 'image', label: 'Image', type: 'text', required: true, placeholder: 'ubuntu-20-04-x64' },
    { name: 'region', label: 'Region', type: 'text', required: true, placeholder: 'nyc1' }
  ],
  endpoints: [],
  configSchema: {
    api_token: { type: 'password', label: 'API Token', required: true }
  }
};

// Linode Integrations
export const linodeInstanceCreate: IntegrationNode = {
  id: 'linode_instance_create',
  name: 'Create Linode Instance',
  description: 'Create a new Linode instance',
  category: 'developer_tools',
  icon: Server,
  color: '#00B04F',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'label', label: 'Instance Label', type: 'text', required: true },
    { name: 'type', label: 'Instance Type', type: 'text', required: true, placeholder: 'g6-nanode-1' },
    { name: 'image', label: 'Image', type: 'text', required: true, placeholder: 'linode/ubuntu20.04' },
    { name: 'region', label: 'Region', type: 'text', required: true, placeholder: 'us-east' }
  ],
  endpoints: [],
  configSchema: {
    token: { type: 'password', label: 'Personal Access Token', required: true }
  }
};

// Vultr Integrations
export const vultrInstanceCreate: IntegrationNode = {
  id: 'vultr_instance_create',
  name: 'Create Vultr Instance',
  description: 'Deploy a new Vultr instance',
  category: 'developer_tools',
  icon: Server,
  color: '#007BFC',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'label', label: 'Instance Label', type: 'text', required: true },
    { name: 'plan', label: 'Plan ID', type: 'text', required: true },
    { name: 'os_id', label: 'OS ID', type: 'text', required: true },
    { name: 'region', label: 'Region ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// Cloud Monitoring
export const cloudwatchCreateAlarm: IntegrationNode = {
  id: 'cloudwatch_create_alarm',
  name: 'Create CloudWatch Alarm',
  description: 'Create a CloudWatch alarm in AWS',
  category: 'analytics',
  icon: Monitor,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'alarm_name', label: 'Alarm Name', type: 'text', required: true },
    { name: 'metric_name', label: 'Metric Name', type: 'text', required: true },
    { name: 'namespace', label: 'Namespace', type: 'text', required: true },
    { name: 'threshold', label: 'Threshold', type: 'number', required: true },
    { name: 'comparison_operator', label: 'Comparison', type: 'select', required: true, options: [
      { label: 'Greater than', value: 'GreaterThanThreshold' },
      { label: 'Less than', value: 'LessThanThreshold' },
      { label: 'Greater than or equal', value: 'GreaterThanOrEqualToThreshold' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    access_key: { type: 'text', label: 'Access Key ID', required: true },
    secret_key: { type: 'password', label: 'Secret Access Key', required: true },
    region: { type: 'text', label: 'AWS Region', required: true }
  }
};

// Cloud Security
export const awsIAMCreateUser: IntegrationNode = {
  id: 'aws_iam_create_user',
  name: 'Create IAM User',
  description: 'Create a new IAM user in AWS',
  category: 'developer_tools',
  icon: Shield,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'path', label: 'Path', type: 'text', required: false, placeholder: '/' },
    { name: 'tags', label: 'Tags (JSON)', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    access_key: { type: 'text', label: 'Access Key ID', required: true },
    secret_key: { type: 'password', label: 'Secret Access Key', required: true }
  }
};

export const azureKeyVaultSecret: IntegrationNode = {
  id: 'azure_keyvault_secret',
  name: 'Store Key Vault Secret',
  description: 'Store a secret in Azure Key Vault',
  category: 'developer_tools',
  icon: Lock,
  color: '#0078D4',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'vault_name', label: 'Key Vault Name', type: 'text', required: true },
    { name: 'secret_name', label: 'Secret Name', type: 'text', required: true },
    { name: 'secret_value', label: 'Secret Value', type: 'password', required: true }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true },
    tenant_id: { type: 'text', label: 'Tenant ID', required: true }
  }
};