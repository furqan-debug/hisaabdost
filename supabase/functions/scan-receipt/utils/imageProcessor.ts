
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
    
    // Step 1: Enhanced grayscale conversion with weighted channels for better text clarity
    for (let i = 0; i < data.length; i += 4) {
      // Use BT.709 coefficients for better grayscale conversion
      const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      data[i] = data[i + 1] = data[i + 2] = gray
    }
    
    // Step 2: Advanced noise reduction - Bilateral filter for edge-preserving smoothing
    const tempData = new Uint8ClampedArray(data)
    const width = img.width
    const height = img.height
    
    // Apply selective noise reduction with edge preservation for better text clarity
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
              if (pixelDiff < 30) {  // Lower threshold for better edge preservation
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
    const blockSize = 35 // Larger block size for more robust thresholding
    const C = 8 // Lower constant for better text detection

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
    
    // Step 4: Enhanced contrast - histogram equalization
    // Create a histogram
    const histogram = new Array(256).fill(0)
    let pixelCount = 0
    
    for (let i = 0; i < data.length; i += 4) {
      histogram[data[i]]++
      pixelCount++
    }
    
    // Calculate the cumulative distribution function (CDF)
    const cdf = new Array(256).fill(0)
    cdf[0] = histogram[0]
    
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i]
    }
    
    // Normalize the CDF to create the lookup table
    const lookupTable = new Array(256).fill(0)
    const cdfMin = cdf.find(val => val > 0) || 0
    
    for (let i = 0; i < 256; i++) {
      lookupTable[i] = Math.round(((cdf[i] - cdfMin) / (pixelCount - cdfMin)) * 255)
    }
    
    // Apply histogram equalization
    for (let i = 0; i < data.length; i += 4) {
      const newVal = lookupTable[data[i]]
      data[i] = data[i + 1] = data[i + 2] = newVal
    }
    
    // Step 5: Apply sharpening for better text legibility
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    
    const tempData2 = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        let val = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4
            val += tempData2[pixelIdx] * sharpenKernel[kernelIdx]
          }
        }
        
        // Clamp value between 0 and 255
        data[idx] = data[idx + 1] = data[idx + 2] = Math.max(0, Math.min(255, val))
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
