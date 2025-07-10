import { supabase } from '@/integrations/supabase/client';

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

export class BinaryDataService {
  
  /**
   * Upload single file to Supabase Storage
   */
  async uploadFile(options: FileUploadOptions): Promise<{
    success: boolean;
    data?: { path: string; fullPath: string; publicUrl?: string };
    error?: string;
  }> {
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
  async uploadBatch(batch: FileBatch): Promise<{
    success: boolean;
    results: Array<{ file: string; success: boolean; path?: string; error?: string }>;
    overallProgress: number;
  }> {
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
  async downloadFile(options: FileDownloadOptions): Promise<{
    success: boolean;
    data?: { blob: Blob; url: string; metadata?: any };
    error?: string;
  }> {
    try {
      let downloadPath = options.path;

      // Apply transformations if specified
      if (options.transform) {
        downloadPath = this.buildTransformUrl(options.path, options.transform);
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
    const processor = this.getProcessorForFile(file);
    
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
   * Create storage bucket with policies
   */
  async createBucket(bucketName: string, isPublic: boolean = true): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Create the bucket via SQL since the JS client doesn't support it
      const { error } = await supabase.rpc('create_storage_bucket', {
        bucket_name: bucketName,
        is_public: isPublic
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Create default policies
      await this.createDefaultPolicies(bucketName, isPublic);

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bucket creation failed' 
      };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(bucket: string, path?: string, limit: number = 100): Promise<{
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
  }> {
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

      return { success: true, data };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'List files failed' 
      };
    }
  }

  /**
   * Generate signed URL for private files
   */
  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<{
    success: boolean;
    data?: { signedUrl: string; path: string };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          signedUrl: data.signedUrl,
          path: path
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signed URL creation failed' 
      };
    }
  }

  /**
   * Get file metadata without downloading
   */
  async getFileInfo(bucket: string, path: string): Promise<{
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
  }> {
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
          size: fileInfo.size || 0,
          mimetype: fileInfo.metadata?.mimetype || '',
          etag: fileInfo.metadata?.eTag || '',
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

  // Private helper methods

  private buildTransformUrl(path: string, transform: FileDownloadOptions['transform']): string {
    if (!transform) return path;

    const params = new URLSearchParams();
    
    if (transform.width) params.append('width', transform.width.toString());
    if (transform.height) params.append('height', transform.height.toString());
    if (transform.quality) params.append('quality', transform.quality.toString());
    if (transform.format) params.append('format', transform.format);
    if (transform.resize) params.append('resize', transform.resize);

    return `${path}?${params.toString()}`;
  }

  private getProcessorForFile(file: File): BinaryDataProcessor | null {
    if (file.type.startsWith('image/')) {
      return new ImageProcessor();
    }
    
    if (file.type.startsWith('video/')) {
      return new VideoProcessor();
    }

    if (file.type === 'application/pdf') {
      return new PDFProcessor();
    }

    return null;
  }

  private async createDefaultPolicies(bucketName: string, isPublic: boolean): Promise<void> {
    if (isPublic) {
      // Create public read policy
      await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: `Public read for ${bucketName}`,
        definition: 'true',
        command: 'SELECT'
      });
    }

    // Create authenticated user upload policy
    await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `Authenticated users can upload to ${bucketName}`,
      definition: 'auth.uid() IS NOT NULL',
      command: 'INSERT'
    });
  }
}

// File processors

class ImageProcessor implements BinaryDataProcessor {
  supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  async processFile(file: File): Promise<ProcessedFile> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Get dimensions
        const dimensions = { width: img.width, height: img.height };

        // Create thumbnail
        const thumbnailSize = 150;
        canvas.width = thumbnailSize;
        canvas.height = thumbnailSize;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, thumbnailSize, thumbnailSize);
          canvas.toBlob((thumbnailBlob) => {
            const thumbnail = thumbnailBlob ? new File([thumbnailBlob], `thumb_${file.name}`, { type: 'image/jpeg' }) : undefined;
            
            resolve({
              file,
              metadata: {
                size: file.size,
                type: file.type,
                dimensions
              },
              thumbnail,
              preview: canvas.toDataURL('image/jpeg', 0.7)
            });
          }, 'image/jpeg', 0.7);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

class VideoProcessor implements BinaryDataProcessor {
  supportedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];

  async processFile(file: File): Promise<ProcessedFile> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        resolve({
          file,
          metadata: {
            size: file.size,
            type: file.type,
            dimensions: { width: video.videoWidth, height: video.videoHeight },
            duration: video.duration
          }
        });
      };

      video.src = URL.createObjectURL(file);
    });
  }
}

class PDFProcessor implements BinaryDataProcessor {
  supportedTypes = ['application/pdf'];

  async processFile(file: File): Promise<ProcessedFile> {
    // This would require pdf.js or similar library for full implementation
    return {
      file,
      metadata: {
        size: file.size,
        type: file.type,
        pages: 1 // Placeholder - would need pdf.js to get actual page count
      }
    };
  }
}

export const binaryDataService = new BinaryDataService();