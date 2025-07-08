import { IntegrationService, IntegrationNode } from '@/types/integrations';
import { Upload, Download, Trash2, List, FolderPlus, Search, FileText, Share } from 'lucide-react';

export const googleDriveService: IntegrationService = {
  id: 'google-drive',
  name: 'Google Drive',
  description: 'Google Drive file storage integration',
  category: 'file_storage',
  icon: Upload,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  actions: [
    {
      id: 'upload_file',
      name: 'Upload File',
      description: 'Upload a file to Google Drive',
      type: 'action',
      fields: [
        { name: 'fileName', label: 'File Name', type: 'text', required: true, placeholder: 'document.pdf' },
        { name: 'fileContent', label: 'File Content (Base64)', type: 'textarea', required: true, placeholder: 'data:application/pdf;base64,JVBERi0xLjQK...' },
        { name: 'folderId', label: 'Folder ID', type: 'text', required: false, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'description', label: 'Description', type: 'text', required: false, placeholder: 'Uploaded via automation' }
      ],
      endpoint: { id: 'upload', name: 'Upload File', description: 'Upload file to Google Drive', method: 'POST', path: '/google-drive/files', parameters: {} }
    },
    {
      id: 'download_file',
      name: 'Download File',
      description: 'Download a file from Google Drive',
      type: 'action',
      fields: [
        { name: 'fileId', label: 'File ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' }
      ],
      endpoint: { id: 'download', name: 'Download File', description: 'Download file from Google Drive', method: 'GET', path: '/google-drive/files', parameters: {} }
    },
    {
      id: 'list_files',
      name: 'List Files',
      description: 'List files in Google Drive',
      type: 'action',
      fields: [
        { name: 'folderId', label: 'Folder ID', type: 'text', required: false, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'query', label: 'Search Query', type: 'text', required: false, placeholder: 'name contains "report"' },
        { name: 'pageSize', label: 'Max Results', type: 'number', required: false, defaultValue: 100 }
      ],
      endpoint: { id: 'list', name: 'List Files', description: 'List files in Google Drive', method: 'GET', path: '/google-drive/list', parameters: {} }
    },
    {
      id: 'delete_file',
      name: 'Delete File',
      description: 'Delete a file from Google Drive',
      type: 'action',
      fields: [
        { name: 'fileId', label: 'File ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' }
      ],
      endpoint: { id: 'delete', name: 'Delete File', description: 'Delete file from Google Drive', method: 'DELETE', path: '/google-drive/files', parameters: {} }
    },
    {
      id: 'create_folder',
      name: 'Create Folder',
      description: 'Create a new folder in Google Drive',
      type: 'action',
      fields: [
        { name: 'name', label: 'Folder Name', type: 'text', required: true, placeholder: 'New Folder' },
        { name: 'parentId', label: 'Parent Folder ID', type: 'text', required: false, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' }
      ],
      endpoint: { id: 'create_folder', name: 'Create Folder', description: 'Create folder in Google Drive', method: 'POST', path: '/google-drive/folders', parameters: {} }
    },
    {
      id: 'share_file',
      name: 'Share File',
      description: 'Share a file in Google Drive',
      type: 'action',
      fields: [
        { name: 'fileId', label: 'File ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'email', label: 'Email to Share With', type: 'text', required: true, placeholder: 'user@example.com' },
        { name: 'role', label: 'Permission Role', type: 'select', required: true, options: [
          { label: 'Viewer', value: 'reader' },
          { label: 'Commenter', value: 'commenter' },
          { label: 'Editor', value: 'writer' }
        ]}
      ],
      endpoint: { id: 'share', name: 'Share File', description: 'Share file in Google Drive', method: 'POST', path: '/google-drive/share', parameters: {} }
    }
  ]
};

export const googleDriveUploadFile: IntegrationNode = {
  ...googleDriveService,
  id: 'google-drive-upload-file',
  name: 'Google Drive - Upload File',
  type: 'action',
  icon: Upload,
  serviceId: 'google-drive',
  actionId: 'upload_file',
  fields: googleDriveService.actions[0].fields,
  endpoints: [googleDriveService.actions[0].endpoint]
};

export const googleDriveDownloadFile: IntegrationNode = {
  ...googleDriveService,
  id: 'google-drive-download-file',
  name: 'Google Drive - Download File',
  type: 'action',
  icon: Download,
  serviceId: 'google-drive',
  actionId: 'download_file',
  fields: googleDriveService.actions[1].fields,
  endpoints: [googleDriveService.actions[1].endpoint]
};

export const googleDriveListFiles: IntegrationNode = {
  ...googleDriveService,
  id: 'google-drive-list-files',
  name: 'Google Drive - List Files',
  type: 'action',
  icon: List,
  serviceId: 'google-drive',
  actionId: 'list_files',
  fields: googleDriveService.actions[2].fields,
  endpoints: [googleDriveService.actions[2].endpoint]
};

export const googleDriveDeleteFile: IntegrationNode = {
  ...googleDriveService,
  id: 'google-drive-delete-file',
  name: 'Google Drive - Delete File',
  type: 'action',
  icon: Trash2,
  serviceId: 'google-drive',
  actionId: 'delete_file',
  fields: googleDriveService.actions[3].fields,
  endpoints: [googleDriveService.actions[3].endpoint]
};

export const googleDriveCreateFolder: IntegrationNode = {
  ...googleDriveService,
  id: 'google-drive-create-folder',
  name: 'Google Drive - Create Folder',
  type: 'action',
  icon: FolderPlus,
  serviceId: 'google-drive',
  actionId: 'create_folder',
  fields: googleDriveService.actions[4].fields,
  endpoints: [googleDriveService.actions[4].endpoint]
};

export const googleDriveShareFile: IntegrationNode = {
  ...googleDriveService,
  id: 'google-drive-share-file',
  name: 'Google Drive - Share File',
  type: 'action',
  icon: Share,
  serviceId: 'google-drive',
  actionId: 'share_file',
  fields: googleDriveService.actions[5].fields,
  endpoints: [googleDriveService.actions[5].endpoint]
};

export const awsS3Service: IntegrationService = {
  id: 'aws-s3',
  name: 'AWS S3',
  description: 'Amazon S3 file storage integration',
  category: 'file_storage',
  icon: Upload,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  actions: [
    {
      id: 'upload_object',
      name: 'Upload Object',
      description: 'Upload an object to S3 bucket',
      type: 'action',
      fields: [
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-bucket' },
        { name: 'key', label: 'Object Key', type: 'text', required: true, placeholder: 'documents/file.pdf' },
        { name: 'body', label: 'File Content (Base64)', type: 'textarea', required: true, placeholder: 'data:application/pdf;base64,JVBERi0xLjQK...' },
        { name: 'contentType', label: 'Content Type', type: 'text', required: false, placeholder: 'application/pdf' }
      ],
      endpoint: { id: 'upload', name: 'Upload Object', description: 'Upload object to S3', method: 'POST', path: '/aws-s3/objects', parameters: {} }
    },
    {
      id: 'download_object',
      name: 'Download Object',
      description: 'Download an object from S3 bucket',
      type: 'action',
      fields: [
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-bucket' },
        { name: 'key', label: 'Object Key', type: 'text', required: true, placeholder: 'documents/file.pdf' }
      ],
      endpoint: { id: 'download', name: 'Download Object', description: 'Download object from S3', method: 'GET', path: '/aws-s3/objects', parameters: {} }
    },
    {
      id: 'list_objects',
      name: 'List Objects',
      description: 'List objects in S3 bucket',
      type: 'action',
      fields: [
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-bucket' },
        { name: 'prefix', label: 'Prefix', type: 'text', required: false, placeholder: 'documents/' },
        { name: 'maxKeys', label: 'Max Keys', type: 'number', required: false, defaultValue: 1000 }
      ],
      endpoint: { id: 'list', name: 'List Objects', description: 'List objects in S3', method: 'GET', path: '/aws-s3/list', parameters: {} }
    },
    {
      id: 'delete_object',
      name: 'Delete Object',
      description: 'Delete an object from S3 bucket',
      type: 'action',
      fields: [
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-bucket' },
        { name: 'key', label: 'Object Key', type: 'text', required: true, placeholder: 'documents/file.pdf' }
      ],
      endpoint: { id: 'delete', name: 'Delete Object', description: 'Delete object from S3', method: 'DELETE', path: '/aws-s3/objects', parameters: {} }
    },
    {
      id: 'generate_presigned_url',
      name: 'Generate Presigned URL',
      description: 'Generate a presigned URL for S3 object access',
      type: 'action',
      fields: [
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-bucket' },
        { name: 'key', label: 'Object Key', type: 'text', required: true, placeholder: 'documents/file.pdf' },
        { name: 'expiresIn', label: 'Expires In (seconds)', type: 'number', required: false, defaultValue: 3600 },
        { name: 'operation', label: 'Operation', type: 'select', required: true, options: [
          { label: 'GET (Download)', value: 'getObject' },
          { label: 'PUT (Upload)', value: 'putObject' }
        ]}
      ],
      endpoint: { id: 'presigned_url', name: 'Generate Presigned URL', description: 'Generate presigned URL for S3', method: 'POST', path: '/aws-s3/presigned-url', parameters: {} }
    }
  ]
};

export const awsS3UploadObject: IntegrationNode = {
  ...awsS3Service,
  id: 'aws-s3-upload-object',
  name: 'AWS S3 - Upload Object',
  type: 'action',
  icon: Upload,
  serviceId: 'aws-s3',
  actionId: 'upload_object',
  fields: awsS3Service.actions[0].fields,
  endpoints: [awsS3Service.actions[0].endpoint]
};

export const awsS3DownloadObject: IntegrationNode = {
  ...awsS3Service,
  id: 'aws-s3-download-object',
  name: 'AWS S3 - Download Object',
  type: 'action',
  icon: Download,
  serviceId: 'aws-s3',
  actionId: 'download_object',
  fields: awsS3Service.actions[1].fields,
  endpoints: [awsS3Service.actions[1].endpoint]
};

export const awsS3ListObjects: IntegrationNode = {
  ...awsS3Service,
  id: 'aws-s3-list-objects',
  name: 'AWS S3 - List Objects',
  type: 'action',
  icon: List,
  serviceId: 'aws-s3',
  actionId: 'list_objects',
  fields: awsS3Service.actions[2].fields,
  endpoints: [awsS3Service.actions[2].endpoint]
};

export const awsS3DeleteObject: IntegrationNode = {
  ...awsS3Service,
  id: 'aws-s3-delete-object',
  name: 'AWS S3 - Delete Object',
  type: 'action',
  icon: Trash2,
  serviceId: 'aws-s3',
  actionId: 'delete_object',
  fields: awsS3Service.actions[3].fields,
  endpoints: [awsS3Service.actions[3].endpoint]
};

export const awsS3GeneratePresignedUrl: IntegrationNode = {
  ...awsS3Service,
  id: 'aws-s3-generate-presigned-url',
  name: 'AWS S3 - Generate Presigned URL',
  type: 'action',
  icon: FileText,
  serviceId: 'aws-s3',
  actionId: 'generate_presigned_url',
  fields: awsS3Service.actions[4].fields,
  endpoints: [awsS3Service.actions[4].endpoint]
};

// Keep backward compatibility
export const googleDriveIntegration: IntegrationNode = googleDriveUploadFile;
export const awsS3Integration: IntegrationNode = awsS3UploadObject;

// Dropbox integration (keeping simpler for now)
export const dropboxIntegration: IntegrationNode = {
  id: 'dropbox-upload-file',
  name: 'Dropbox - Upload File',
  description: 'Upload a file to Dropbox',
  category: 'file_storage',
  icon: Upload,
  color: '#0061FF',
  type: 'action',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  fields: [
    { name: 'path', label: 'File Path', type: 'text', required: true, placeholder: '/documents/file.pdf' },
    { name: 'content', label: 'File Content (Base64)', type: 'textarea', required: true, placeholder: 'data:application/pdf;base64,JVBERi0xLjQK...' },
    { name: 'mode', label: 'Write Mode', type: 'select', required: false, options: [
      { label: 'Add (create new)', value: 'add' },
      { label: 'Overwrite', value: 'overwrite' }
    ]}
  ],
  endpoints: [
    { id: 'upload', name: 'Upload File', description: 'Upload file to Dropbox', method: 'POST', path: '/dropbox/files', parameters: {} }
  ]
};
