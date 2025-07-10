import { supabase } from '@/integrations/supabase/client';
import { 
  FileUploadOptions, 
  FileDownloadOptions, 
  FileBatch, 
  ProcessedFile,
  FileUploadResult,
  FileDownloadResult,
  FileBatchResult,
  FileListResult,
  FileInfoResult
} from '@/types/binaryData';
import { getProcessorForFile } from './fileProcessors';
import { storageUtils } from './storage/storageUtils';

export class BinaryDataService {
  
  /**
   * Upload single file to Supabase Storage
   */
  async uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
    try {
      const filePath = options.path 
        ? `${options.path}/${options.file.name}`
        : `${Date.now()}-${options.file.name}`;

      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, options.file, {
          contentType: options.contentType || options.file.type,
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
          metadata: options.metadata
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL if bucket is public
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: urlData.publicUrl
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Upload multiple files in batch
   */
  async uploadBatch(batch: FileBatch): Promise<FileBatchResult> {
    const results: Array<{ file: string; success: boolean; path?: string; error?: string }> = [];
    let completedFiles = 0;

    for (const file of batch.files) {
      try {
        const result = await this.uploadFile({
          bucket: batch.bucket,
          path: batch.pathPrefix,
          file,
          upsert: true
        });

        results.push({
          file: file.name,
          success: result.success,
          path: result.data?.path,
          error: result.error
        });

        completedFiles++;
        const progress = (completedFiles / batch.files.length) * 100;
        
        if (batch.progressCallback) {
          batch.progressCallback(progress, file.name);
        }

      } catch (error) {
        results.push({
          file: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        completedFiles++;
      }
    }

    const successfulUploads = results.filter(r => r.success).length;
    
    return {
      success: successfulUploads > 0,
      results,
      overallProgress: 100
    };
  }

  /**
   * Download file from Supabase Storage
   */
  async downloadFile(options: FileDownloadOptions): Promise<FileDownloadResult> {
    try {
      let downloadPath = options.path;

      // Apply transformations if specified
      if (options.transform) {
        downloadPath = storageUtils.buildTransformUrl(options.path, options.transform);
      }

      const { data, error } = await supabase.storage
        .from(options.bucket)
        .download(downloadPath);

      if (error) {
        return { success: false, error: error.message };
      }

      const url = URL.createObjectURL(data);

      return {
        success: true,
        data: {
          blob: data,
          url,
          metadata: {
            size: data.size,
            type: data.type
          }
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Download failed' 
      };
    }
  }

  /**
   * Process file and extract metadata
   */
  async processFile(file: File): Promise<ProcessedFile> {
    const processor = getProcessorForFile(file);
    
    if (processor) {
      return await processor.processFile(file);
    }

    // Default processing
    return {
      file,
      metadata: {
        size: file.size,
        type: file.type
      }
    };
  }

  /**
   * List files in bucket
   */
  async listFiles(bucket: string, path?: string, limit: number = 100): Promise<FileListResult> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data.map(file => ({
          name: file.name,
          id: file.id || '',
          size: (file.metadata as any)?.size || 0,
          created_at: file.created_at || '',
          updated_at: file.updated_at || '',
          last_accessed_at: file.last_accessed_at || '',
          metadata: file.metadata || {}
        }))
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'List files failed' 
      };
    }
  }

  /**
   * Get file metadata without downloading
   */
  async getFileInfo(bucket: string, path: string): Promise<FileInfoResult> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error || !data || data.length === 0) {
        return { success: false, error: error?.message || 'File not found' };
      }

      const fileInfo = data[0];

      return {
        success: true,
        data: {
          size: (fileInfo.metadata as any)?.size || 0,
          mimetype: (fileInfo.metadata as any)?.mimetype || '',
          etag: (fileInfo.metadata as any)?.eTag || '',
          created_at: fileInfo.created_at || '',
          updated_at: fileInfo.updated_at || '',
          last_accessed_at: fileInfo.last_accessed_at || '',
          metadata: fileInfo.metadata || {}
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Get file info failed' 
      };
    }
  }

  // Delegate storage operations to StorageUtils
  async createBucket(bucketName: string, isPublic: boolean = true) {
    return storageUtils.createBucket(bucketName, isPublic);
  }

  async deleteFile(bucket: string, path: string) {
    return storageUtils.deleteFile(bucket, path);
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    return storageUtils.createSignedUrl(bucket, path, expiresIn);
  }
}

export const binaryDataService = new BinaryDataService();