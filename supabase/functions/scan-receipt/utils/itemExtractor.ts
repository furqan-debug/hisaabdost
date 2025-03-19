// Functions for extracting line items from receipt text

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  // More precise price pattern that handles different formats
  const pricePattern = /\$?\s*(\d+\.\d{2})\s*$/;
  
  // Skip the first few lines (likely header) and last few lines (likely footer)
  const startIndex = Math.min(5, Math.floor(lines.length * 0.15));
  const endIndex = Math.max(lines.length - 5, Math.ceil(lines.length * 0.8));
  
  console.log(`Looking for items between lines ${startIndex} and ${endIndex}`);
  
  // First pass: identify likely item lines with prices
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip header/footer lines
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Check for price pattern at the end of the line
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const price = priceMatch[1];
      
      // Extract item name by removing the price part
      let itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
      
      // Clean up item name - remove common prefixes, quantities
      itemName = cleanupItemName(itemName);
      
      if (itemName && price && parseFloat(price) > 0) {
        console.log(`Found item: "${itemName}" with price: $${price}`);
        items.push({
          name: itemName,
          amount: price,
          category: "Shopping"
        });
      }
    }
  }
  
  // If we found very few items, try a more aggressive approach
  if (items.length <= 1) {
    console.log("Few items found, trying aggressive item extraction");
    extractItemsAggressively(lines, startIndex, endIndex, items);
  }
  
  // Filter out any items with zero or negative prices, or non-descriptive names
  const validItems = items.filter(item => {
    const price = parseFloat(item.amount);
    return !isNaN(price) && 
           price > 0 && 
           item.name.length > 1 && 
           !item.name.match(/^\d+$/) && // Not just digits
           !isCommonNonItemText(item.name);
  });
  
  console.log(`Found ${validItems.length} valid items out of ${items.length} total items`);
  return validItems;
}

// Check if a line should be skipped when searching for items
export function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  return lowerLine.includes("receipt") || 
    lowerLine.includes("order") || 
    lowerLine.includes("tel:") || 
    lowerLine.includes("phone") || 
    lowerLine.includes("address") || 
    lowerLine.includes("thank you") ||
    lowerLine.includes("subtotal") ||
    lowerLine.includes("total") ||
    lowerLine.includes("change") ||
    lowerLine.includes("cash") ||
    lowerLine.includes("card") ||
    lowerLine.includes("payment") ||
    lowerLine.includes("tax") ||
    lowerLine.includes("date") ||
    lowerLine.includes("store") ||
    lowerLine.includes("coupon") ||
    lowerLine.includes("discount") ||
    lowerLine.match(/^\d+$/) || // Just a number
    lowerLine.match(/^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$/); // Just a date
}

// Clean up an item name by removing common prefixes and special characters
export function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  // Remove quantity indicators
  cleanName = cleanName.replace(/^\d+\s*x\s*/i, ''); // Remove "2 x " prefix
  cleanName = cleanName.replace(/^\d+\s+/i, ''); // Remove "2 " prefix
  cleanName = cleanName.replace(/^item\s*\d*\s*/i, ''); // Remove "Item 1" prefix
  
  // Remove special characters but keep apostrophes and hyphens
  cleanName = cleanName.replace(/[\*\#\$\@\%\(\)]/g, '');
  
  // Remove common SKU/product code patterns
  cleanName = cleanName.replace(/\b[A-Z0-9]{5,10}\b/g, '');
  
  // Remove multiple spaces and trim
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  // If the name is too short or all numbers, replace with a generic name
  if (cleanName.length < 2 || /^\d+$/.test(cleanName)) {
    return "Store Item";
  }
  
  // Capitalize first letter of each word
  cleanName = cleanName.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
  
  return cleanName;
}

// Check if text is commonly found in receipts but isn't an actual item
function isCommonNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes("total") || 
         lowerText.includes("subtotal") || 
         lowerText.includes("tax") || 
         lowerText.includes("change") || 
         lowerText.includes("balance") || 
         lowerText.includes("cash") || 
         lowerText.includes("card") || 
         lowerText === "item" || 
         lowerText === "qty" || 
         lowerText === "amount" || 
         lowerText === "price";
}

// Try a more aggressive approach to extract items from receipt text
export function extractItemsAggressively(
  lines: string[], 
  startIndex: number, 
  endIndex: number, 
  items: Array<{name: string; amount: string; category: string}>
): void {
  // Look for any numeric values that could be prices
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip already processed lines or clear non-item lines
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Look for price-like patterns anywhere in the line
    const priceMatches = Array.from(line.matchAll(/\$?\s*(\d+\.\d{2})/g));
    
    if (priceMatches.length === 1) {
      const price = priceMatches[0][1];
      
      // Get the text before the price as the item name
      let itemName = line.substring(0, line.indexOf(priceMatches[0][0])).trim();
      
      // If no text before price, check if this is a continuation line
      if (!itemName && i > 0) {
        const prevLine = lines[i-1].trim();
        if (!shouldSkipLine(prevLine) && !prevLine.match(/\d+\.\d{2}/)) {
          itemName = prevLine;
        }
      }
      
      // Clean up the item name
      itemName = cleanupItemName(itemName);
      
      if (itemName && price && parseFloat(price) > 0 && 
          !items.some(item => item.name === itemName && item.amount === price) &&
          !isCommonNonItemText(itemName)) {
        console.log(`[Pass 2] Found item: "${itemName}" with price: $${price}`);
        items.push({
          name: itemName,
          amount: price,
          category: "Shopping"
        });
      }
    }
    // For cases where the price might be on the next line
    else if (priceMatches.length === 0 && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const nextLinePriceMatch = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      
      if (nextLinePriceMatch && line.length > 3 && !shouldSkipLine(line)) {
        const itemName = cleanupItemName(line);
        const price = nextLinePriceMatch[1];
        
        if (parseFloat(price) > 0 && !isCommonNonItemText(itemName)) {
          console.log(`[Pass 3] Found item spanning two lines: "${itemName}" with price: $${price}`);
          items.push({
            name: itemName,
            amount: price,
            category: "Shopping"
          });
          
          // Skip the next line since we've used it
          i++;
        }
      }
    }
  }
}
