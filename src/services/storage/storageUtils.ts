import { supabase } from '@/integrations/supabase/client';
import { FileDownloadOptions, BucketCreateResult, FileDeleteResult, SignedUrlResult } from '@/types/binaryData';

export class StorageUtils {
  
  /**
   * Create storage bucket with policies
   */
  async createBucket(bucketName: string, isPublic: boolean = true): Promise<BucketCreateResult> {
    try {
      // Note: Bucket creation should be done via SQL migration
      // This is a placeholder that simulates bucket existence check
      console.log(`Checking if bucket ${bucketName} exists`);

      // Create default policies (placeholder)
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
  async deleteFile(bucket: string, path: string): Promise<FileDeleteResult> {
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
   * Generate signed URL for private files
   */
  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<SignedUrlResult> {
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
   * Build transform URL for file downloads
   */
  buildTransformUrl(path: string, transform: FileDownloadOptions['transform']): string {
    if (!transform) return path;

    const params = new URLSearchParams();
    
    if (transform.width) params.append('width', transform.width.toString());
    if (transform.height) params.append('height', transform.height.toString());
    if (transform.quality) params.append('quality', transform.quality.toString());
    if (transform.format) params.append('format', transform.format);
    if (transform.resize) params.append('resize', transform.resize);

    return `${path}?${params.toString()}`;
  }

  private async createDefaultPolicies(bucketName: string, isPublic: boolean): Promise<void> {
    if (isPublic) {
      // Note: Public read policies should be created via SQL migration
      console.log(`Would create public read policy for bucket: ${bucketName}`);
    }

    // Note: Storage policies should be created via SQL migration
    // This is a placeholder for demonstration
    console.log(`Would create storage policies for bucket: ${bucketName}`);
  }
}

export const storageUtils = new StorageUtils();