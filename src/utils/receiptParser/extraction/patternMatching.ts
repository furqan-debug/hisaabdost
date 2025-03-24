
import { isNonItemText } from "../utils";
import { cleanupItemName } from "./itemNameCleaner";

/**
 * Common patterns to identify non-item lines
 */
export function getNonItemPatterns(): RegExp[] {
  return [
    /subtotal|tax|total|balance|due|change|cash|card|payment|credit|debit|master|visa|transaction|receipt|thank|you/i,
    /\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}/,  // Date patterns
    /^\s*\d+\s*$/,  // Just a number
    /^\s*\*+\s*$/,  // Just asterisks
    /^\s*\-+\s*$/   // Just dashes
  ];
}

/**
 * Extracts items using standard price patterns
 */
export function extractItemsWithPricePatterns(
  lines: string[], 
  startIndex: number, 
  endIndex: number
): Array<{name: string; amount: string}> {
  const items: Array<{name: string; amount: string}> = [];
  const nonItemPatterns = getNonItemPatterns();
  
  // Common price patterns for different receipt formats
  const pricePatterns = [
    // Standard price pattern (e.g., $10.99 or 10.99)
    /(?:^|\s)(\$?\s*\d+\.\d{2})\s*$/,
    // Price with quantity (e.g., 2 x $10.99)
    /(\d+)\s*[xX]\s*\$?\s*(\d+\.\d{2})/,
    // Price anywhere in the line
    /\$?\s*(\d+\.\d{2})/
  ];
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip lines that match non-item patterns
    if (nonItemPatterns.some(pattern => line.match(pattern))) {
      continue;
    }
    
    let matched = false;
    
    // Try each price pattern
    for (const pattern of pricePatterns) {
      const priceMatch = line.match(pattern);
      if (priceMatch) {
        matched = true;
        
        // Extract price based on pattern type
        let price = "";
        let itemName = "";
        
        if (pattern.toString().includes('[xX]')) {
          // Handle quantity pattern
          const qty = parseInt(priceMatch[1]);
          price = priceMatch[2].replace('$', '').trim();
          itemName = line.substring(0, line.indexOf(priceMatch[0])).trim();
          
          // Add quantity indicator to item name if not already there
          if (!itemName.includes(qty.toString())) {
            itemName = `${itemName} (${qty}x)`;
          }
        } else {
          // Standard price pattern
          price = priceMatch[1].replace('$', '').trim();
          
          // Extract the item name by removing the price part
          const priceIndex = line.lastIndexOf(priceMatch[0]);
          if (priceIndex > 0) {
            itemName = line.substring(0, priceIndex).trim();
          } else {
            // If price is at the beginning, look for item name after it
            itemName = line.substring(priceMatch[0].length).trim();
          }
        }
        
        // Clean up item name
        itemName = cleanupItemName(itemName);
        
        // Skip if item name is too short or the price is zero
        if (itemName.length >= 2 && parseFloat(price) > 0 && !isNonItemText(itemName)) {
          console.log(`Found item: "${itemName}" with price $${price}`);
          items.push({
            name: itemName,
            amount: price
          });
          break; // Found a match, no need to try other patterns
        }
      }
    }
    
    // If we didn't match any price pattern, check for split lines
    if (!matched && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const nextLinePriceMatch = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      
      if (nextLinePriceMatch && line.length > 2 && 
          !nonItemPatterns.some(pattern => line.match(pattern))) {
        // Clean up this item name
        let itemName = cleanupItemName(line);
        
        if (itemName.length >= 2 && !isNonItemText(itemName)) {
          console.log(`Found split-line item: "${itemName}" with price $${nextLinePriceMatch[1]}`);
          items.push({
            name: itemName,
            amount: nextLinePriceMatch[1].replace('$', '').trim()
          });
          i++; // Skip the next line since we've processed it
        }
      }
    }
  }
  
  return items;
}
