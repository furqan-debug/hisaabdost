
// Functions for extracting line items from receipt text

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  const pricePattern = /\$?\s?(\d+\.\d{2})\s*$/;
  
  // Skip the first few lines (likely header) and last few lines (likely footer)
  const startIndex = Math.min(5, Math.floor(lines.length * 0.2));
  const endIndex = Math.max(lines.length - 5, Math.ceil(lines.length * 0.75));
  
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
        // Always set category to "Shopping" for OCR-scanned receipts
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
  
  // Filter out any items with zero or negative prices
  const validItems = items.filter(item => {
    const price = parseFloat(item.amount);
    return !isNaN(price) && price > 0 && item.name.length > 1;
  });
  
  console.log(`Found ${validItems.length} valid items out of ${items.length} total items`);
  return validItems;
}

// Check if a line should be skipped when searching for items
export function shouldSkipLine(line: string): boolean {
  return line.toLowerCase().includes("receipt") || 
    line.toLowerCase().includes("order") || 
    line.toLowerCase().includes("tel:") || 
    line.toLowerCase().includes("phone") || 
    line.toLowerCase().includes("address") || 
    line.toLowerCase().includes("thank you") ||
    line.match(/^\s*$/) ||
    line.toLowerCase().includes("subtotal") ||
    line.toLowerCase().includes("total") ||
    line.toLowerCase().includes("change") ||
    line.toLowerCase().includes("cash") ||
    line.toLowerCase().includes("card") ||
    line.toLowerCase().includes("payment") ||
    line.toLowerCase().includes("tax") ||
    line.toLowerCase().match(/^\d+$/) || // Just a number
    line.match(/^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$/); // Just a date
}

// Clean up an item name by removing common prefixes and special characters
export function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  cleanName = cleanName.replace(/^\d+\s*x\s*/i, ''); // Remove "2 x " prefix
  cleanName = cleanName.replace(/^\d+\s+/i, ''); // Remove "2 " prefix
  cleanName = cleanName.replace(/^item\s*\d*\s*/i, ''); // Remove "Item 1" prefix
  cleanName = cleanName.replace(/[\*\#\$\@]/g, ''); // Remove special characters
  
  // Remove common SKU/product code patterns
  cleanName = cleanName.replace(/\b[A-Z0-9]{5,10}\b/g, '');
  
  // Trim any remaining whitespace
  cleanName = cleanName.trim();
  
  // If the name is too short or all numbers, replace with a generic name
  if (cleanName.length < 2 || /^\d+$/.test(cleanName)) {
    return "Item";
  }
  
  return cleanName;
}

// Try a more aggressive approach to extract items from receipt text
export function extractItemsAggressively(
  lines: string[], 
  startIndex: number, 
  endIndex: number, 
  items: Array<{name: string; amount: string; category: string}>
): void {
  // Second pass: look for any numeric values that could be prices
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip already processed lines or clear non-item lines
    if (line.toLowerCase().includes("total") || 
        line.toLowerCase().includes("tax") ||
        line.toLowerCase().includes("subtotal") ||
        line.length < 3) {
      continue;
    }
    
    // Look for price-like patterns anywhere in the line
    const priceMatches = Array.from(line.matchAll(/\$?\s?(\d+\.\d{2})/g));
    
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
          !items.some(item => item.name === itemName && item.amount === price)) {
        console.log(`[Pass 2] Found item: "${itemName}" with price: $${price}`);
        items.push({
          name: itemName || "Unknown Item",
          amount: price,
          // Always set category to "Shopping" for OCR-scanned receipts
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
        
        if (parseFloat(price) > 0) {
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
