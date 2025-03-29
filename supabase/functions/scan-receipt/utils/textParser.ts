
import { formatPrice, capitalizeFirstLetter } from "./formatting.ts";
import { extractDate } from "./dateExtractor.ts";
import { extractLineItems } from "./itemExtractor.ts";
import { cleanItemText } from "./items/itemPatterns.ts";

// Parse receipt text into a structured format
export function parseReceiptText(text: string) {
  console.log("Starting receipt text parsing");
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`Parsing ${lines.length} lines of text`);
  
  // Extract date from receipt or use current date as fallback
  const date = extractDate(text) || new Date().toISOString().split('T')[0];
  console.log("Extracted date:", date);
  
  // Try to extract store name
  const storeName = extractStoreName(lines);
  console.log("Extracted store name:", storeName);
  
  // Extract line items and their prices
  const items = extractLineItems(lines);
  console.log(`Extracted ${items.length} items`);
  
  // Return structured data
  return {
    storeName,
    date,
    items,
    text // Include the original text for debugging
  };
}

// Extract store name from receipt (usually at the top)
function extractStoreName(lines: string[]): string {
  // Look at first few lines for store name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip very short lines and potential non-store text
    if (line.length < 3 || isLikelyNonStoreName(line)) {
      continue;
    }
    
    // Check for potential store name indicators
    if (line === line.toUpperCase() && line.length > 3) {
      return capitalizeFirstLetter(line.toLowerCase());
    }
    
    // Common store identifiers
    if (line.match(/(?:mart|market|store|shop|supermarket|grocery)/i) && 
        !line.match(/receipt|invoice|tel|fax|date|time/i)) {
      return capitalizeFirstLetter(line);
    }
  }
  
  // Second pass, less strict
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && !line.match(/^[\d\.]+$/)) {
      return capitalizeFirstLetter(line);
    }
  }
  
  return "Store";
}

// Helper to identify text that's unlikely to be a store name
function isLikelyNonStoreName(text: string): boolean {
  const nonStorePatterns = [
    /receipt/i, /invoice/i, /tel/i, /telephone/i, /fax/i, 
    /date/i, /time/i, /customer/i, /order/i, /transaction/i,
    /^\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4}$/, // Date patterns
    /^\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?$/, // Time patterns
    /^[\d\s\*\-\+\=]{1,10}$/ // Just numbers or symbols
  ];
  
  return nonStorePatterns.some(pattern => text.match(pattern));
}
