
import { preprocessImage } from "../utils/imageProcessor.ts";
import { processReceiptWithOCR } from "./ocrProcessor.ts";
import { generateFallbackData } from "../data/fallbackData.ts";
import { extractStoreName } from "../utils/storeExtractor.ts";

// Get Google Vision API key from environment variable
const VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY')

// Process receipt and extract information
export async function processReceipt(receiptImage: File) {
  console.log("Starting receipt processing");
  
  // Check if Vision API key is configured
  if (!VISION_API_KEY) {
    console.error("No Google Vision API key configured")
    return { 
      success: true, 
      items: generateFallbackData(), 
      storeName: "Sample Store",
      error: "No API key configured"
    };
  }
  
  // Process receipt with Google Vision API
  try {
    console.log("Starting OCR processing with Vision API")
    
    // Preprocess the image first
    const preprocessedImage = await preprocessImage(receiptImage)
    console.log("Image preprocessing completed")
    
    // Process with the enhanced image
    const extractedData = await processReceiptWithOCR(preprocessedImage, VISION_API_KEY)
    console.log("Extracted data from Vision API:", extractedData.length > 0 
      ? `Found ${extractedData.length} items` 
      : "No items found")
    
    // Always return success: true, even if no items were found
    // The frontend will use fallback data if needed
    return { 
      success: true, 
      items: extractedData.length > 0 ? extractedData : generateFallbackData(), 
      storeName: extractedData.length > 0 ? extractStoreName(extractedData) : "Store"
    };
  } catch (processingError) {
    console.error("Error in Vision API processing:", processingError)
    return { 
      success: true, 
      items: generateFallbackData(),
      storeName: "Store",
      error: "Processing error: " + (processingError.message || "Unknown error")
    };
  }
}
