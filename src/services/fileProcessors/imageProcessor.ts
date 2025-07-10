import { BinaryDataProcessor, ProcessedFile } from '@/types/binaryData';

export class ImageProcessor implements BinaryDataProcessor {
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