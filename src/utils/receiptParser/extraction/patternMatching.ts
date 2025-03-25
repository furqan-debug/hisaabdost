
import { isNonItemText } from "../utils";
import { cleanupItemName } from "./itemNameCleaner";

/**
 * Common patterns to identify non-item lines
 */
export function getNonItemPatterns(): RegExp[] {
  return [
    /subtotal|tax|total|balance|due|change|cash|card|payment|credit|debit|master|visa|transaction|receipt|thank|you/i,
    /\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}|\d{2}\.\d{2}\.\d{4}/,  // Date patterns including European
    /^\s*\d+\s*$/,  // Just a number
    /^\s*\*+\s*$/,  // Just asterisks
    /^\s*\-+\s*$/,  // Just dashes
    /customer|cashier|operator|till|terminal|store|branch|counter/i  // Receipt metadata
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
    // European price pattern with comma (e.g., 10,99€ or 10,99)
    /(?:^|\s)(\d+,\d{2}(?:\s*[€£])?)\s*$/,
    // Price with quantity (e.g., 2 x $10.99)
    /(\d+)\s*[xX]\s*\$?\s*(\d+[\.,]\d{2})/,
    // Price anywhere in the line
    /\$?\s*(\d+\.\d{2})/,
    // European price anywhere in the line
    /(\d+,\d{2})(?:\s*[€£])?/,
    // Price with multiple spaces separation (common in European supermarkets)
    /(.+?)\s{2,}(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/,
    // Supermarket pattern with potential weight (e.g., "Apples 0.5kg 3.99")
    /(.+?)\s+\d+[\.,]\d+\s*(?:kg|g|lb)\s+(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/
  ];
  
  // Add supermarket-specific patterns
  const supermarketPatterns = [
    // Common European supermarket format
    /^(\d+)\s+(.+?)\s+(\d+,\d{2})$/,
    // Format with item code at start (e.g., "12345 Bread 2.99")
    /^\d{3,}\s+(.+?)\s+(\d+[\.,]\d{2})$/,
    // Format with quantity indicator (e.g., "2 pcs Bread 2.99")
    /^(\d+)\s+(?:pcs|st|pc|x)\s+(.+?)\s+(\d+[\.,]\d{2})$/
  ];
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip lines that match non-item patterns
    if (nonItemPatterns.some(pattern => line.match(pattern))) {
      continue;
    }
    
    let matched = false;
    
    // Check supermarket patterns first
    for (const pattern of supermarketPatterns) {
      const match = line.match(pattern);
      if (match) {
        matched = true;
        
        let itemName = "";
        let price = "";
        
        if (pattern.toString().includes('pcs|st|pc|x')) {
          // Format with explicit quantity indicator
          const qty = parseInt(match[1]);
          itemName = cleanupItemName(match[2]);
          price = match[3].replace(',', '.');
          
          // Add quantity to item name
          itemName = `${itemName} (${qty}x)`;
        } else if (pattern.toString().includes('^(\\d+)\\s+(.+?)\\s+(\\d+,\\d{2})')) {
          // European supermarket format
          const qty = parseInt(match[1]);
          itemName = cleanupItemName(match[2]);
          price = match[3].replace(',', '.');
          
          // Add quantity to item name if > 1
          if (qty > 1) {
            itemName = `${itemName} (${qty}x)`;
          }
        } else {
          // Generic item code format
          itemName = cleanupItemName(match[1]);
          price = match[2].replace(',', '.');
        }
        
        // Skip if item name is too short or the price is zero
        if (itemName.length >= 2 && parseFloat(price) > 0 && !isNonItemText(itemName)) {
          console.log(`Found supermarket item: "${itemName}" with price ${price}`);
          items.push({
            name: itemName,
            amount: price
          });
          break; // Found a match, no need to try other patterns
        }
      }
    }
    
    // Try regular price patterns if no supermarket match
    if (!matched) {
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
            price = priceMatch[2].replace('$', '').replace(',', '.').trim();
            itemName = line.substring(0, line.indexOf(priceMatch[0])).trim();
            
            // Add quantity indicator to item name if not already there
            if (!itemName.includes(qty.toString())) {
              itemName = `${itemName} (${qty}x)`;
            }
          } else if (pattern.toString().includes('kg|g|lb')) {
            // Handle weight-based items
            itemName = priceMatch[1].trim();
            price = priceMatch[2].replace(',', '.').trim();
          } else {
            // Standard price pattern
            price = priceMatch[1].replace('$', '').replace('€', '').replace('£', '').replace(',', '.').trim();
            
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
            console.log(`Found item: "${itemName}" with price ${price}`);
            items.push({
              name: itemName,
              amount: price
            });
            break; // Found a match, no need to try other patterns
          }
        }
      }
    }
    
    // If we didn't match any price pattern, check for split lines
    if (!matched && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      // Try multiple formats for price-only lines
      const nextLinePriceMatch = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/) || 
                                 nextLine.match(/^\s*(\d+,\d{2})(?:\s*[€£])?\s*$/);
      
      if (nextLinePriceMatch && line.length > 2 && 
          !nonItemPatterns.some(pattern => line.match(pattern))) {
        // Clean up this item name
        let itemName = cleanupItemName(line);
        let price = nextLinePriceMatch[1].replace(',', '.');
        
        if (itemName.length >= 2 && !isNonItemText(itemName)) {
          console.log(`Found split-line item: "${itemName}" with price ${price}`);
          items.push({
            name: itemName,
            amount: price
          });
          i++; // Skip the next line since we've processed it
        }
      }
    }
  }
  
  return items;
}

// Special handler for supermarket receipts
export function extractSupermarketItems(
  lines: string[], 
  startIndex: number, 
  endIndex: number
): Array<{name: string; amount: string}> {
  const items: Array<{name: string; amount: string}> = [];
  const nonItemPatterns = getNonItemPatterns();
  
  // First, check if it's likely a supermarket receipt
  const isLikelySupermarket = lines.some(line => 
    line.toLowerCase().includes('supermarket') ||
    line.toLowerCase().includes('groceries') ||
    line.toLowerCase().includes('aldi') ||
    line.toLowerCase().includes('lidl') ||
    line.toLowerCase().includes('tesco') ||
    line.toLowerCase().includes('carrefour') ||
    line.toLowerCase().includes('kaufland') ||
    line.toLowerCase().includes('rewe') ||
    line.toLowerCase().includes('edeka') ||
    line.toLowerCase().includes('spar')
  );
  
  if (!isLikelySupermarket) {
    return items; // Not a supermarket receipt, return empty array
  }
  
  // Special patterns for supermarket item lines
  const itemPatterns = [
    // Format: ITEM NAME         10,99
    /^(.{3,}?)\s{2,}(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/,
    
    // Format: ITEM 2pcs         10,99
    /^(.+?\s+\d+\s*(?:pcs|pc|x|st|kg|g))\s{2,}(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/,
    
    // Format: 123456 ITEM NAME  10,99 
    /^\d{3,}\s+(.+?)\s{2,}(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/,
    
    // Format: 2 X ITEM @ 5,99   11,98
    /^(\d+)\s*[xX]\s*(.+?)\s*\@\s*\d+[\.,]\d{2}\s{2,}(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/
  ];
  
  // Process each line to find items
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip non-item lines
    if (line.length < 3 || nonItemPatterns.some(pattern => line.match(pattern))) {
      continue;
    }
    
    let found = false;
    
    // Try each supermarket item pattern
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      
      if (match) {
        found = true;
        let name, price;
        
        if (pattern.toString().includes('\\@')) {
          // Handle quantity with unit price format
          const qty = parseInt(match[1]);
          name = cleanupItemName(match[2]);
          price = match[3].replace(',', '.');
          
          // Add quantity to name
          name = `${name} (${qty}x)`;
        } else if (pattern.toString().includes('pcs|pc|x|st|kg|g')) {
          // Handle format with unit indicator
          name = cleanupItemName(match[1]);
          price = match[2].replace(',', '.');
        } else {
          // Standard item name + price
          name = cleanupItemName(match[1]);
          price = match[2].replace(',', '.');
        }
        
        // Validate item
        if (name.length >= 2 && parseFloat(price) > 0 && !isNonItemText(name)) {
          console.log(`Found supermarket item: "${name}" with price ${price}`);
          items.push({
            name,
            amount: price
          });
          break;
        }
      }
    }
    
    // Look for simple price at end pattern if we didn't find a match
    if (!found) {
      // Try the basic pattern: text followed by price with at least 2 spaces
      const basicMatch = line.match(/^(.+?)\s{2,}(\d+[\.,]\d{2})(?:\s*[€£])?\s*$/);
      
      if (basicMatch) {
        const name = cleanupItemName(basicMatch[1]);
        const price = basicMatch[2].replace(',', '.');
        
        if (name.length >= 2 && parseFloat(price) > 0 && !isNonItemText(name)) {
          console.log(`Found basic supermarket item: "${name}" with price ${price}`);
          items.push({
            name,
            amount: price
          });
        }
      }
    }
  }
  
  return items;
}
