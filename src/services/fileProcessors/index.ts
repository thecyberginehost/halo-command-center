import { BinaryDataProcessor } from '@/types/binaryData';
import { ImageProcessor } from './imageProcessor';
import { VideoProcessor } from './videoProcessor';
import { PDFProcessor } from './pdfProcessor';

export { ImageProcessor, VideoProcessor, PDFProcessor };

export function getProcessorForFile(file: File): BinaryDataProcessor | null {
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