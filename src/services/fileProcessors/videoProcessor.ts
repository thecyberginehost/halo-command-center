import { BinaryDataProcessor, ProcessedFile } from '@/types/binaryData';

export class VideoProcessor implements BinaryDataProcessor {
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