
// Preprocess the image to improve OCR accuracy
export async function preprocessImage(imageFile: File) {
  console.log("Starting image preprocessing")
  
  try {
    // Create a blob URL for the image
    const arrayBuffer = await imageFile.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: imageFile.type })
    const imageUrl = URL.createObjectURL(blob)
    
    // Create an image element to load the image
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })
    
    // Create a canvas to manipulate the image
    const canvas = new OffscreenCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      console.error("Could not get canvas context")
      return imageFile
    }
    
    // Draw the original image
    ctx.drawImage(img, 0, 0, img.width, img.height)
    
    // Get image data for manipulation
    const imageData = ctx.getImageData(0, 0, img.width, img.height)
    const data = imageData.data
    
    // Step 1: Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = gray     // R
      data[i + 1] = gray // G
      data[i + 2] = gray // B
    }
    
    // Step 2: Apply noise reduction using a simple box blur
    const tempData = new Uint8ClampedArray(data)
    const width = img.width
    const height = img.height
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        // Apply blur only to non-text areas (avoiding edges)
        // Skip pixels that seem to be text (high contrast)
        const current = data[idx]
        const neighbors = [
          tempData[idx - 4], tempData[idx + 4],          // left, right
          tempData[idx - width * 4], tempData[idx + width * 4]  // top, bottom
        ]
        
        const avg = neighbors.reduce((sum, val) => sum + val, 0) / neighbors.length
        
        // If pixel is similar to neighbors, apply blur (noise reduction)
        if (Math.abs(current - avg) < 30) {  // Threshold for what's considered noise
          data[idx] = data[idx + 1] = data[idx + 2] = avg
        }
      }
    }
    
    // Step 3: Apply adaptive thresholding to improve text clarity
    const blockSize = 15 // Size of neighborhood for adaptive threshold
    const C = 5 // Constant subtracted from mean

    // We'll use a simplified approach for adaptive thresholding
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        
        // Calculate local mean (simplified)
        let sum = 0
        let count = 0
        
        const halfBlock = Math.floor(blockSize / 2)
        const startY = Math.max(0, y - halfBlock)
        const endY = Math.min(height - 1, y + halfBlock)
        const startX = Math.max(0, x - halfBlock)
        const endX = Math.min(width - 1, x + halfBlock)
        
        for (let ny = startY; ny <= endY; ny++) {
          for (let nx = startX; nx <= endX; nx++) {
            sum += data[(ny * width + nx) * 4]
            count++
          }
        }
        
        const mean = sum / count
        
        // Apply threshold
        data[idx] = data[idx + 1] = data[idx + 2] = (data[idx] > mean - C) ? 255 : 0
      }
    }
    
    // Step 4: Enhance contrast for better OCR
    const min = 0
    const max = 255
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast enhancement
      const value = data[i]
      const newVal = (value - min) / (max - min) * 255
      data[i] = data[i + 1] = data[i + 2] = newVal
    }
    
    // Put the processed data back on the canvas
    ctx.putImageData(imageData, 0, 0)
    
    // Convert canvas to blob
    const processedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
    
    // Clean up
    URL.revokeObjectURL(imageUrl)
    
    // Create a new File object with the processed image
    const processedFile = new File([processedBlob], imageFile.name, { 
      type: 'image/jpeg',
      lastModified: new Date().getTime()
    })
    
    console.log("Image preprocessing completed successfully")
    return processedFile
    
  } catch (error) {
    console.error("Error during image preprocessing:", error)
    console.log("Falling back to original image")
    return imageFile // Fall back to the original image
  }
}
