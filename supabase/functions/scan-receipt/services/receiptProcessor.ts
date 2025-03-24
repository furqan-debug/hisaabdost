
import { preprocessImage } from "../utils/imageProcessor.ts";
import { processReceiptWithOCR, processReceiptWithTesseract } from "./ocrProcessor.ts";
import { generateFallbackData } from "../data/fallbackData.ts";
import { extractStoreName } from "../utils/storeExtractor.ts";

// Get Google Vision API key from environment variable
const VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');

// Process receipt and extract information
export async function processReceipt(receiptImage: File) {
  console.log("Starting receipt processing");
  
  // Process receipt with appropriate OCR method
  try {
    console.log("Starting OCR processing");
    
    // Preprocess the image first
    const preprocessedImage = await preprocessImage(receiptImage);
    console.log("Image preprocessing completed");
    
    // Choose OCR method based on API key availability
    let extractedData = [];
    if (VISION_API_KEY) {
      console.log("Using Google Vision API for OCR");
      extractedData = await processReceiptWithOCR(preprocessedImage, VISION_API_KEY);
    } else {
      console.log("No Google Vision API key configured, using simplified OCR");
      extractedData = await processReceiptWithTesseract(preprocessedImage);
    }
    
    console.log("Extracted data:", extractedData.length > 0 
      ? `Found ${extractedData.length} items` 
      : "No items found");
    
    // Post-process extracted data to enhance relevance
    const enhancedData = postProcessItems(extractedData);
    
    // Always return success: true, even if no items were found
    // The frontend will use fallback data if needed
    return { 
      success: true, 
      items: enhancedData.length > 0 ? enhancedData : generateFallbackData(), 
      storeName: extractedData.length > 0 ? extractStoreName(extractedData) : "Store"
    };
  } catch (processingError) {
    console.error("Error in OCR processing:", processingError);
    return { 
      success: true, 
      items: generateFallbackData(),
      storeName: "Store",
      error: "Processing error: " + (processingError.message || "Unknown error")
    };
  }
}

// Post-process items to enhance relevance and remove duplicates
function postProcessItems(items: any[]) {
  if (!items || items.length === 0) return [];
  
  // Filter out items with very generic names
  const filteredItems = items.filter(item => {
    const name = (item.name || '').toLowerCase();
    return name.length >= 3 && 
           !name.includes('subtotal') && 
           !name.includes('total') && 
           !name.includes('tax');
  });
  
  // If filtering removed all items, return the original items
  if (filteredItems.length === 0 && items.length > 0) {
    return items;
  }
  
  // Remove duplicate items (same name and amount)
  const uniqueItems = new Map();
  for (const item of filteredItems) {
    const key = `${item.name}|${item.amount}`;
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, item);
    }
  }
  
  return Array.from(uniqueItems.values());
}
