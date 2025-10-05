/**
 * Image quality detection for receipt scanning
 * Analyzes image quality to warn users before scanning
 */

export interface QualityIssue {
  type: 'blur' | 'dark' | 'low-contrast' | 'too-small';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

export interface QualityAnalysis {
  score: number; // 0-100
  isAcceptable: boolean;
  issues: QualityIssue[];
}

/**
 * Analyze image quality for receipt scanning
 */
export async function analyzeImageQuality(file: File): Promise<QualityAnalysis> {
  try {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Resize for analysis (faster)
    const maxDim = 800;
    const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const issues: QualityIssue[] = [];
    
    // Check resolution
    if (img.width < 600 || img.height < 600) {
      issues.push({
        type: 'too-small',
        severity: 'high',
        message: 'Image resolution is too low',
        suggestion: 'Try taking a closer photo or use a better camera'
      });
    }
    
    // Check brightness
    const brightness = calculateBrightness(imageData);
    if (brightness < 60) {
      issues.push({
        type: 'dark',
        severity: brightness < 40 ? 'high' : 'medium',
        message: 'Image is too dark',
        suggestion: 'Try using better lighting or flash'
      });
    }
    
    // Check contrast
    const contrast = calculateContrast(imageData);
    if (contrast < 30) {
      issues.push({
        type: 'low-contrast',
        severity: contrast < 20 ? 'high' : 'medium',
        message: 'Image has low contrast',
        suggestion: 'Try flattening the receipt and avoiding shadows'
      });
    }
    
    // Check sharpness (blur detection)
    const sharpness = calculateSharpness(imageData);
    if (sharpness < 15) {
      issues.push({
        type: 'blur',
        severity: sharpness < 10 ? 'high' : 'medium',
        message: 'Image appears blurry',
        suggestion: 'Hold the camera steady and ensure the receipt is in focus'
      });
    }
    
    // Calculate overall score
    const score = calculateOverallScore(brightness, contrast, sharpness, img.width, img.height);
    const isAcceptable = score >= 50 && !issues.some(i => i.severity === 'high');
    
    return {
      score,
      isAcceptable,
      issues
    };
  } catch (error) {
    console.error('Quality analysis failed:', error);
    // Return acceptable on error to not block user
    return {
      score: 70,
      isAcceptable: true,
      issues: []
    };
  }
}

function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let sum = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  
  return (sum / (data.length / 4)) / 255 * 100;
}

function calculateContrast(imageData: ImageData): number {
  const data = imageData.data;
  const values: number[] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    values.push((data[i] + data[i + 1] + data[i + 2]) / 3);
  }
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return (stdDev / 255) * 100;
}

function calculateSharpness(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let sum = 0;
  let count = 0;
  
  // Laplacian edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      const top = ((y - 1) * width + x) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;
      
      const grayTop = (data[top] + data[top + 1] + data[top + 2]) / 3;
      const grayBottom = (data[bottom] + data[bottom + 1] + data[bottom + 2]) / 3;
      const grayLeft = (data[left] + data[left + 1] + data[left + 2]) / 3;
      const grayRight = (data[right] + data[right + 1] + data[right + 2]) / 3;
      
      const laplacian = Math.abs(4 * gray - grayTop - grayBottom - grayLeft - grayRight);
      sum += laplacian;
      count++;
    }
  }
  
  return (sum / count) / 255 * 100;
}

function calculateOverallScore(
  brightness: number,
  contrast: number,
  sharpness: number,
  width: number,
  height: number
): number {
  // Weighted scoring
  const brightnessScore = Math.min(100, Math.max(0, (brightness - 40) * 2));
  const contrastScore = Math.min(100, contrast * 2);
  const sharpnessScore = Math.min(100, sharpness * 4);
  const resolutionScore = Math.min(100, Math.min(width, height) / 10);
  
  return Math.round(
    brightnessScore * 0.25 +
    contrastScore * 0.25 +
    sharpnessScore * 0.35 +
    resolutionScore * 0.15
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
