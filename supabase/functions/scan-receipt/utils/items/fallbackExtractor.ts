
import { cleanupItemName } from "./itemCleanup";
import { isNonItemText, shouldSkipLine } from "./itemHelpers";
import { guessCategoryFromItemName } from "./itemCategories";
import { deduplicateItems } from "./itemHelpers";

// Fallback extraction method if the direct pattern matching fails
export function fallbackItemExtraction(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  
  // Process all lines to look for price patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or known non-item lines
    if (line.length < 3 || shouldSkipLine(line)) {
      continue;
    }
    
    // Look for a line that has a price pattern
    // First try to find an exact price at the end of the line (most common format)
    const exactPriceMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})$/);
    if (exactPriceMatch) {
      const itemName = cleanupItemName(exactPriceMatch[1]);
      const price = exactPriceMatch[2];
      
      if (itemName.length >= 2 && !isNonItemText(itemName) && parseFloat(price) > 0) {
        items.push({
          name: itemName,
          amount: price,
          category: guessCategoryFromItemName(itemName)
        });
        continue;
      }
    }
    
    // Then check for any price in the line
    const anyPriceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
    if (anyPriceMatch) {
      // Extract the position of the price
      const priceIndex = line.indexOf(anyPriceMatch[0]);
      
      // If price is at the end, extract the item name from before it
      if (priceIndex > 0 && priceIndex > line.length / 2) {
        const itemName = cleanupItemName(line.substring(0, priceIndex).trim());
        const price = anyPriceMatch[1];
        
        if (itemName.length >= 2 && !isNonItemText(itemName) && parseFloat(price) > 0) {
          items.push({
            name: itemName,
            amount: price,
            category: guessCategoryFromItemName(itemName)
          });
        }
      }
    }
    
    // Check for multi-line items where the price is on the next line
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      // If the next line is just a price, this line might be an item name
      const nextLinePriceMatch = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      
      if (nextLinePriceMatch && !shouldSkipLine(line) && !isNonItemText(line)) {
        const itemName = cleanupItemName(line);
        const price = nextLinePriceMatch[1];
        
        if (itemName.length >= 2 && parseFloat(price) > 0) {
          items.push({
            name: itemName,
            amount: price,
            category: guessCategoryFromItemName(itemName)
          });
          i++; // Skip the next line since we've processed it
        }
      }
    }
  }
  
  return deduplicateItems(items);
}
