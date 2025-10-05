/**
 * Client-side image enhancement for receipt scanning
 * Improves OCR accuracy for damaged, faded, or poorly photographed receipts
 */

interface EnhancementOptions {
  enhanceContrast?: boolean;
  sharpen?: boolean;
  denoise?: boolean;
  autoRotate?: boolean;
}

export interface ImageQualityScore {
  overall: number; // 0-100
  contrast: number;
  sharpness: number;
  lighting: number;
}

/**
 * Enhance image for better OCR results
 */
export async function enhanceReceiptImage(
  file: File, 
  options: EnhancementOptions = {}
): Promise<File> {
  const {
    enhanceContrast = true,
    sharpen = true,
    denoise = true,
    autoRotate = false
  } = options;

  try {
    console.log('🎨 Starting image enhancement:', file.name);
    
    // Load image
    const img = await loadImage(file);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to get canvas context');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply enhancements
    if (enhanceContrast) {
      imageData = applyContrastEnhancement(imageData);
    }
    
    if (sharpen) {
      imageData = applySharpen(imageData);
    }
    
    if (denoise) {
      imageData = applyDenoise(imageData);
    }
    
    // Put enhanced image back
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to file
    const enhancedFile = await canvasToFile(canvas, file.name, file.type);
    
    console.log('✅ Image enhancement complete:', {
      original: `${(file.size / 1024).toFixed(1)}KB`,
      enhanced: `${(enhancedFile.size / 1024).toFixed(1)}KB`
    });
    
    return enhancedFile;
  } catch (error) {
    console.error('❌ Image enhancement failed:', error);
    // Return original file on error
    return file;
  }
}

/**
 * Apply adaptive contrast enhancement (CLAHE-like)
 */
function applyContrastEnhancement(imageData: ImageData): ImageData {
  const data = imageData.data;
  const histogram = new Array(256).fill(0);
  
  // Build histogram
  for (let i = 0; i < data.length; i += 4) {
    const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    histogram[avg]++;
  }
  
  // Calculate cumulative distribution
  const cdf = new Array(256);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }
  
  // Normalize
  const totalPixels = imageData.width * imageData.height;
  const cdfMin = cdf.find(v => v > 0) || 0;
  
  // Apply equalization
  for (let i = 0; i < data.length; i += 4) {
    const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    const newValue = Math.round(((cdf[avg] - cdfMin) / (totalPixels - cdfMin)) * 255);
    
    // Apply to all channels
    const factor = newValue / (avg || 1);
    data[i] = Math.min(255, Math.round(data[i] * factor));
    data[i + 1] = Math.min(255, Math.round(data[i + 1] * factor));
    data[i + 2] = Math.min(255, Math.round(data[i + 2] * factor));
  }
  
  return imageData;
}

/**
 * Apply unsharp masking for sharpening
 */
function applySharpen(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const outputData = new Uint8ClampedArray(data);
  
  // Sharpen kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += data[idx] * kernel[kernelIdx];
          }
        }
        const idx = (y * width + x) * 4 + c;
        outputData[idx] = Math.max(0, Math.min(255, sum));
      }
    }
  }
  
  return new ImageData(outputData, width, height);
}

/**
 * Apply simple denoising filter
 */
function applyDenoise(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const outputData = new Uint8ClampedArray(data);
  
  // Simple box blur for denoising
  const radius = 1;
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx];
            count++;
          }
        }
        
        const idx = (y * width + x) * 4 + c;
        outputData[idx] = Math.round(sum / count);
      }
    }
  }
  
  return new ImageData(outputData, width, height);
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert canvas to file
 */
async function canvasToFile(
  canvas: HTMLCanvasElement, 
  fileName: string, 
  mimeType: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      const file = new File([blob], fileName, { type: mimeType });
      resolve(file);
    }, mimeType, 0.95);
  });
}
