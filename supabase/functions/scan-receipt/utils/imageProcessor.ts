
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
    
    // Step 1: Convert to grayscale with enhanced contrast
    for (let i = 0; i < data.length; i += 4) {
      // Better grayscale algorithm with weighted channels for text clarity
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = data[i + 1] = data[i + 2] = gray
    }
    
    // Step 2: Apply noise reduction - Bilateral filter for edge-preserving smoothing
    const tempData = new Uint8ClampedArray(data)
    const width = img.width
    const height = img.height
    
    // Apply noise reduction with edge preservation for better text clarity
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = (y * width + x) * 4
        
        // Use a 5x5 window for more effective noise reduction
        let sum = 0
        let count = 0
        let centerPixel = data[idx]
        
        // Process the 5x5 window
        for (let ky = -2; ky <= 2; ky++) {
          for (let kx = -2; kx <= 2; kx++) {
            const nidx = ((y + ky) * width + (x + kx)) * 4
            if (nidx >= 0 && nidx < data.length) {
              // Weight based on spatial distance and intensity difference (bilateral filter)
              const pixelDiff = Math.abs(centerPixel - tempData[nidx])
              // Only include pixels that are similar in intensity (preserves edges/text)
              if (pixelDiff < 35) {  // Threshold for intensity similarity
                sum += tempData[nidx]
                count++
              }
            }
          }
        }
        
        // Apply the bilateral filter result
        if (count > 0) {
          data[idx] = data[idx + 1] = data[idx + 2] = sum / count
        }
      }
    }
    
    // Step 3: Apply adaptive thresholding for better text extraction
    const blockSize = 25 // Larger block size for more robust thresholding
    const C = 10 // Constant for threshold adjustment

    // More sophisticated adaptive thresholding
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        
        // Calculate local mean with larger neighborhood
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
        
        const localMean = sum / count
        
        // Apply thresholding with local mean
        data[idx] = data[idx + 1] = data[idx + 2] = (data[idx] > localMean - C) ? 255 : 0
      }
    }
    
    // Step 4: Enhance contrast - stretch histogram
    let min = 255
    let max = 0
    
    // Find min and max gray values
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < min) min = data[i]
      if (data[i] > max) max = data[i]
    }
    
    // Stretch histogram if there's a valid range
    if (max > min) {
      const range = max - min
      for (let i = 0; i < data.length; i += 4) {
        const normalized = (data[i] - min) / range * 255
        data[i] = data[i + 1] = data[i + 2] = normalized
      }
    }
    
    // Put the processed data back on the canvas
    ctx.putImageData(imageData, 0, 0)
    
    // Convert canvas to blob with higher quality
    const processedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
    
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
