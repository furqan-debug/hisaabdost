
import { preprocessImage } from "../utils/imageProcessor.ts";
import { processReceiptWithOCR, processReceiptWithTesseract } from "./ocrProcessor.ts";
import { generateFallbackData } from "../data/fallbackData.ts";
import { extractDate } from "../utils/dateExtractor.ts";
import { cleanItemText, isLikelyItemLine } from "../utils/items/itemPatterns.ts";
import { guessCategoryFromItemName } from "../utils/items/itemCategories.ts";

// Get Google Vision API key from environment variable
const VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');

// Process receipt and extract information
export async function processReceipt(receiptImage: File, enhancedProcessing = false) {
  console.log(`Starting receipt processing with ${enhancedProcessing ? 'enhanced' : 'standard'} processing`);
  
  try {
    // Preprocess the image first
    console.log("Starting image preprocessing");
    const preprocessedImage = await preprocessImage(receiptImage);
    console.log("Image preprocessing completed");
    
    // Choose OCR method based on API key availability
    let extractedText = "";
    let receiptDate = new Date().toISOString().split('T')[0];
    let storeName = "Store";
    
    try {
      if (VISION_API_KEY) {
        console.log("Using Google Vision API for OCR");
        const ocrResult = await processReceiptWithOCR(preprocessedImage, VISION_API_KEY, enhancedProcessing);
        extractedText = ocrResult.text;
        receiptDate = ocrResult.date || receiptDate;
        storeName = ocrResult.merchant || storeName;
      } else {
        console.log("No Google Vision API key configured, using simplified OCR");
        const tesseractResult = await processReceiptWithTesseract(preprocessedImage);
        extractedText = tesseractResult.text;
        receiptDate = tesseractResult.date || receiptDate;
        storeName = tesseractResult.merchant || storeName;
      }
      
      console.log("OCR processing completed");
      console.log("OCR extracted text sample:", extractedText.substring(0, 200));
      
      // Extract items from the OCR text
      const extractedItems = extractItemsFromText(extractedText, receiptDate);
      
      // Check if we found any usable data
      if (extractedItems.length > 0) {
        return { 
          success: true, 
          items: extractedItems, 
          storeName: storeName,
          date: receiptDate
        };
      } else {
        console.log("No usable items found after processing, using fallback data");
        return { 
          success: true, 
          items: generateFallbackData(), 
          storeName: storeName,
          date: receiptDate,
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
      date: new Date().toISOString().split('T')[0],
      error: "Processing error: " + (processingError.message || "Unknown error")
    };
  }
}

// Extract items from OCR text
function extractItemsFromText(text: string, receiptDate: string) {
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract items
  const items = [];
  const seenItems = new Set(); // To track duplicates
  
  // Extract store name from the first few lines
  let storeName = extractStoreName(lines);
  
  // First pass: Look for clear item-price patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    // Skip headers, footers, and non-item lines
    if (!isLikelyItemLine(line)) continue;
    
    // Look for price at the end of the line (common pattern)
    const priceMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})$/);
    if (priceMatch) {
      const name = cleanItemText(priceMatch[1]);
      const price = priceMatch[2];
      
      // Create a key to detect duplicates
      const itemKey = `${name.toLowerCase()}-${price}`;
      
      // Only add if not seen before and has valid name and price
      if (!seenItems.has(itemKey) && name.length >= 2 && parseFloat(price) > 0) {
        items.push({
          name: name,
          amount: price,
          category: guessCategoryFromItemName(name),
          date: receiptDate
        });
        seenItems.add(itemKey);
      }
      continue;
    }
    
    // Look for quantity x item format
    const qtyMatch = line.match(/(\d+)\s*[xX]\s*(.+?)\s*@\s*\$?(\d+\.\d{2})/);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1]);
      const name = cleanItemText(qtyMatch[2]);
      const unitPrice = parseFloat(qtyMatch[3]);
      const totalPrice = (qty * unitPrice).toFixed(2);
      
      // Create a key to detect duplicates
      const itemKey = `${name.toLowerCase()}-${totalPrice}`;
      
      // Only add if not seen before and has valid name and price
      if (!seenItems.has(itemKey) && name.length >= 2 && unitPrice > 0) {
        items.push({
          name: `${name} (${qty}x)`,
          amount: totalPrice,
          category: guessCategoryFromItemName(name),
          date: receiptDate
        });
        seenItems.add(itemKey);
      }
      continue;
    }
    
    // Second pass: Look for price anywhere in the line
    const anyPriceMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})/);
    if (anyPriceMatch) {
      const name = cleanItemText(anyPriceMatch[1]);
      const price = anyPriceMatch[2];
      
      // Create a key to detect duplicates
      const itemKey = `${name.toLowerCase()}-${price}`;
      
      // Only add if not seen before and has valid name and price
      if (!seenItems.has(itemKey) && name.length >= 2 && parseFloat(price) > 0) {
        items.push({
          name: name,
          amount: price,
          category: guessCategoryFromItemName(name),
          date: receiptDate
        });
        seenItems.add(itemKey);
      }
    }
  }
  
  // Sort by price (highest first)
  items.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  
  return items;
}

// Extract store name from the first few lines
function extractStoreName(lines: string[]) {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip very short lines
    if (line.length < 3) continue;
    
    // Skip lines with common non-store patterns
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you/i)) continue;
    
    // Potential store name - uppercase words are often store names at the top
    if (line.toUpperCase() === line && line.length > 3) {
      return cleanItemText(line.toLowerCase());
    }
    
    // Another pattern - first line that's not a date, number, etc.
    if (!line.match(/^\d/) && !line.match(/^[A-Z]{1,3}$/) && line.length > 3) {
      return cleanItemText(line);
    }
  }
  
  return "Store";  // Default if no store name found
}
