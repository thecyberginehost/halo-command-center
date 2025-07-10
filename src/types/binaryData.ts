export interface FileUploadOptions {
  bucket: string;
  path?: string;
  file: File;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, any>;
  upsert?: boolean;
}

export interface FileDownloadOptions {
  bucket: string;
  path: string;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    resize?: 'cover' | 'contain' | 'fill';
  };
}

export interface FileBatch {
  files: File[];
  bucket: string;
  pathPrefix?: string;
  progressCallback?: (progress: number, currentFile: string) => void;
}

export interface BinaryDataProcessor {
  processFile(file: File, options?: any): Promise<ProcessedFile>;
  supportedTypes: string[];
}

export interface ProcessedFile {
  file: File;
  metadata: {
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
    duration?: number; // for video/audio
    pages?: number; // for PDFs
    encoding?: string;
  };
  thumbnail?: File;
  preview?: string; // base64 or URL
}

export interface FileUploadResult {
  success: boolean;
  data?: { path: string; fullPath: string; publicUrl?: string };
  error?: string;
}

export interface FileDownloadResult {
  success: boolean;
  data?: { blob: Blob; url: string; metadata?: any };
  error?: string;
}

export interface FileBatchResult {
  success: boolean;
  results: Array<{ file: string; success: boolean; path?: string; error?: string }>;
  overallProgress: number;
}

export interface FileListResult {
  success: boolean;
  data?: Array<{
    name: string;
    id: string;
    size: number;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: any;
  }>;
  error?: string;
}

export interface SignedUrlResult {
  success: boolean;
  data?: { signedUrl: string; path: string };
  error?: string;
}

export interface FileInfoResult {
  success: boolean;
  data?: {
    size: number;
    mimetype: string;
    etag: string;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: any;
  };
  error?: string;
}

export interface BucketCreateResult {
  success: boolean;
  error?: string;
}

export interface FileDeleteResult {
  success: boolean;
  error?: string;
}