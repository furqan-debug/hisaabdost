
import { preprocessImage } from "../utils/imageProcessor.ts";
import { processReceiptWithOCR, processReceiptWithTesseract } from "./ocrProcessor.ts";
import { generateFallbackData } from "../data/fallbackData.ts";
import { extractStoreName } from "../utils/storeExtractor.ts";
import { cleanItemText, isLikelyProduct } from "../utils/items/itemCleanup.ts";

// Get Google Vision API key from environment variable
const VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');

// Process receipt and extract information
export async function processReceipt(receiptImage: File) {
  console.log("Starting receipt processing");
  
  try {
    // Preprocess the image first
    console.log("Starting image preprocessing");
    const preprocessedImage = await preprocessImage(receiptImage);
    console.log("Image preprocessing completed");
    
    // Choose OCR method based on API key availability
    let extractedData = [];
    let storeName = "Store";
    
    try {
      if (VISION_API_KEY) {
        console.log("Using Google Vision API for OCR");
        extractedData = await processReceiptWithOCR(preprocessedImage, VISION_API_KEY);
      } else {
        console.log("No Google Vision API key configured, using simplified OCR");
        extractedData = await processReceiptWithTesseract(preprocessedImage);
      }
      
      console.log("OCR processing completed");
      
      // Extract store name if we have data
      if (extractedData.length > 0) {
        storeName = extractStoreName(extractedData);
      }
      
      // Post-process extracted data to enhance relevance
      const enhancedData = postProcessItems(extractedData);
      
      // Check if we found any usable data
      if (enhancedData.length > 0) {
        return { 
          success: true, 
          items: enhancedData, 
          storeName: storeName
        };
      } else {
        console.log("No usable items found after processing, using fallback data");
        return { 
          success: true, 
          items: generateFallbackData(), 
          storeName: storeName,
          warning: "Could not identify specific items on receipt"
        };
      }
    } catch (ocrError) {
      console.error("Error in OCR processing:", ocrError);
      throw ocrError;
    }
  } catch (processingError) {
    console.error("Error in receipt processing:", processingError);
    return { 
      success: false, 
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
    if (!item.name) return false;
    
    // Clean up the item name
    const cleanedName = cleanItemText(item.name);
    
    // Check if it's likely a product
    return isLikelyProduct(cleanedName);
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
  
  // Sort items by price (higher first) to find main purchases
  const sortedItems = Array.from(uniqueItems.values())
    .sort((a, b) => {
      const amountA = parseFloat(a.amount) || 0;
      const amountB = parseFloat(b.amount) || 0;
      return amountB - amountA;
    });
  
  return sortedItems;
}
