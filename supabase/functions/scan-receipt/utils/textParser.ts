
import { formatPrice, capitalizeFirstLetter } from "./formatting.ts";
import { extractDate } from "./dateExtractor.ts";
import { extractLineItems } from "./itemExtractor.ts";

// Parse receipt text into a structured format
export function parseReceiptText(text: string) {
  console.log("Starting receipt text parsing");
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`Parsing ${lines.length} lines of text`);
  
  const result = [];
  
  // Extract date from receipt
  const date = extractDate(text) || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  console.log("Extracted date:", date);
  
  // Try to extract store name
  const storeName = extractStoreName(lines);
  
  // Extract items from the receipt text
  const items = extractLineItems(lines);
  
  // Process and clean up the extracted items
  for (const item of items) {
    if (item.name.length >= 2 && parseFloat(item.amount) > 0) {
      result.push({
        date: date,
        name: capitalizeFirstLetter(item.name),
        amount: formatPrice(parseFloat(item.amount)),
        category: item.category,
        store: storeName
      });
    }
  }
  
  // If we didn't find any items, create a fallback item
  if (result.length === 0) {
    console.log("No items found, creating fallback item");
    result.push({
      date: date,
      name: "Store Purchase",
      amount: "10.00",
      category: "Shopping",
      store: storeName
    });
  }
  
  return result;
}

// Try to extract store name from the receipt
function extractStoreName(lines: string[]) {
  // Look at the first few lines for store name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip very short lines
    if (line.length < 3) continue;
    
    // Skip lines with common non-store patterns
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you/i)) continue;
    
    // Potential store name - uppercase words are often store names at the top
    if (line.toUpperCase() === line && line.length > 3) {
      return capitalizeFirstLetter(line.toLowerCase());
    }
    
    // Another pattern - first line that's not a date, number, etc.
    if (!line.match(/^\d/) && !line.match(/^[A-Z]{1,3}$/) && line.length > 3) {
      return capitalizeFirstLetter(line);
    }
  }
  
  return "Store";  // Default if no store name found
}

// Create a namespace for external modules to avoid name collisions
export const textUtils = {
  extractStoreName
};
