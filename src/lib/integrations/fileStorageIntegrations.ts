import { IntegrationNode } from '@/types/integrations';
import { Cloud, FolderOpen, HardDrive } from 'lucide-react';

export const googleDriveIntegration: IntegrationNode = {
  id: 'google_drive',
  name: 'Google Drive',
  description: 'Manage files in Google Drive',
  category: 'file_storage',
  icon: Cloud,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  configSchema: {
    client_id: {
      type: 'text',
      label: 'Client ID',
      required: true
    },
    client_secret: {
      type: 'password',
      label: 'Client Secret',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Upload File', value: 'upload' },
        { label: 'Download File', value: 'download' },
        { label: 'List Files', value: 'list' },
        { label: 'Delete File', value: 'delete' },
        { label: 'Share File', value: 'share' },
        { label: 'Create Folder', value: 'create_folder' }
      ]
    },
    {
      name: 'file_path',
      label: 'File Path',
      type: 'text',
      required: false,
      placeholder: '/documents/report.pdf'
    },
    {
      name: 'folder_id',
      label: 'Folder ID',
      type: 'text',
      required: false,
      placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    },
    {
      name: 'share_email',
      label: 'Share with Email',
      type: 'text',
      required: false,
      helpText: 'Email address to share file with'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Operation',
      description: 'Execute Google Drive operation',
      method: 'POST',
      path: '/googledrive/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        file_data: {
          type: 'textarea',
          label: 'File Data',
          required: false
        }
      }
    }
  ]
};

export const awsS3Integration: IntegrationNode = {
  id: 'aws_s3',
  name: 'AWS S3',
  description: 'Manage files in Amazon S3',
  category: 'file_storage',
  icon: Cloud,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    access_key_id: {
      type: 'text',
      label: 'Access Key ID',
      required: true
    },
    secret_access_key: {
      type: 'password',
      label: 'Secret Access Key',
      required: true
    },
    region: {
      type: 'select',
      label: 'Region',
      required: true,
      options: [
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'US West (Oregon)', value: 'us-west-2' },
        { label: 'EU (Ireland)', value: 'eu-west-1' },
        { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' }
      ]
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'S3 Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Upload File', value: 'upload' },
        { label: 'Download File', value: 'download' },
        { label: 'List Objects', value: 'list' },
        { label: 'Delete File', value: 'delete' },
        { label: 'Copy File', value: 'copy' },
        { label: 'Generate Presigned URL', value: 'presign' }
      ]
    },
    {
      name: 'bucket_name',
      label: 'Bucket Name',
      type: 'text',
      required: true,
      placeholder: 'my-bucket'
    },
    {
      name: 'object_key',
      label: 'Object Key (Path)',
      type: 'text',
      required: true,
      placeholder: 'documents/file.pdf'
    },
    {
      name: 'acl',
      label: 'Access Control',
      type: 'select',
      required: false,
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Public Read', value: 'public-read' },
        { label: 'Public Read Write', value: 'public-read-write' }
      ]
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute S3 Operation',
      description: 'Execute AWS S3 operation',
      method: 'POST',
      path: '/s3/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        bucket: {
          type: 'text',
          label: 'Bucket',
          required: true
        },
        key: {
          type: 'text',
          label: 'Object Key',
          required: true
        }
      }
    }
  ]
};

export const dropboxIntegration: IntegrationNode = {
  id: 'dropbox',
  name: 'Dropbox',
  description: 'Manage files in Dropbox',
  category: 'file_storage',
  icon: FolderOpen,
  color: '#0061FF',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  configSchema: {
    app_key: {
      type: 'text',
      label: 'App Key',
      required: true
    },
    app_secret: {
      type: 'password',
      label: 'App Secret',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Dropbox Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Upload File', value: 'upload' },
        { label: 'Download File', value: 'download' },
        { label: 'List Folder', value: 'list' },
        { label: 'Delete File', value: 'delete' },
        { label: 'Share File', value: 'share' },
        { label: 'Create Folder', value: 'create_folder' }
      ]
    },
    {
      name: 'file_path',
      label: 'File Path',
      type: 'text',
      required: true,
      placeholder: '/documents/report.pdf'
    },
    {
      name: 'autorename',
      label: 'Auto Rename',
      type: 'boolean',
      required: false,
      defaultValue: false,
      helpText: 'Automatically rename if file exists'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Dropbox Operation',
      description: 'Execute Dropbox operation',
      method: 'POST',
      path: '/dropbox/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        path: {
          type: 'text',
          label: 'File Path',
          required: true
        }
      }
    }
  ]
};