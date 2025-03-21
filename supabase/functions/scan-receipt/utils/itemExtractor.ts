
// Functions for extracting line items from receipt text

// Extract individual line items from receipt text - simplified version
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Skip receipt header (first few lines)
  const startLine = Math.min(5, Math.floor(lines.length * 0.2));
  
  // Skip receipt footer (last few lines)
  const endLine = Math.max(lines.length - 10, Math.ceil(lines.length * 0.7));
  
  // Process the middle portion where items are usually listed
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i].trim();
    if (line.length < 3) continue;  // Skip very short lines
    
    // Skip lines that are clearly headers, footers, or metadata
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Look for price pattern at the end of the line (e.g., 12.34 or $12.34)
    const priceMatch = line.match(/(?:^|\s)(\$?\s*\d+\.\d{2})(?:\s*$)/);
    if (priceMatch) {
      const price = priceMatch[1].replace('$', '').trim();
      const priceValue = parseFloat(price);
      
      // Only consider reasonable prices
      if (priceValue >= 0.10 && priceValue <= 1000.00) {
        // Extract item name by removing the price part
        const itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
        
        // Only add items with reasonable names
        if (itemName.length >= 2 && !isNonItemText(itemName)) {
          items.push({
            name: cleanupItemName(itemName),
            amount: price,
            category: "Shopping"  // Default category for simplicity
          });
        }
      }
    }
  }
  
  // If we found no items with the specific pattern, try a more general approach
  if (items.length === 0) {
    for (let i = startLine; i < endLine; i++) {
      const line = lines[i].trim();
      
      // Skip non-item lines
      if (shouldSkipLine(line) || line.length < 3) {
        continue;
      }
      
      // Look for any price pattern
      const priceMatches = line.match(/\$?(\d+\.\d{2})/g);
      if (priceMatches && priceMatches.length > 0) {
        // Get the last price in the line (usually the item price)
        const price = priceMatches[priceMatches.length - 1].replace('$', '');
        const priceValue = parseFloat(price);
        
        // Only consider reasonable prices
        if (priceValue >= 0.10 && priceValue <= 1000.00) {
          // Get text before the price as the item name
          let itemName = line.substring(0, line.lastIndexOf(price)).trim();
          
          // Clean up common prefixes
          itemName = itemName.replace(/^\d+\s+/, '').trim();
          
          if (itemName.length >= 2 && !isNonItemText(itemName)) {
            items.push({
              name: cleanupItemName(itemName),
              amount: price,
              category: "Shopping"
            });
          }
        }
      }
    }
  }
  
  // Return deduped items sorted by price (largest first)
  return deduplicateItems(items);
}

// Check if a line should be skipped
function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Skip common receipt headers and metadata
  if (lowerLine.includes("receipt") ||
      lowerLine.includes("invoice") ||
      lowerLine.includes("store #") || 
      lowerLine.includes("tel:") || 
      lowerLine.includes("thank you") ||
      lowerLine.includes("subtotal") ||
      lowerLine.includes("total") ||
      lowerLine.includes("change") ||
      lowerLine.includes("cash") ||
      lowerLine.includes("card") ||
      lowerLine.includes("payment") ||
      lowerLine.includes("tax") ||
      lowerLine.includes("date") ||
      lowerLine.includes("time")) {
    return true;
  }
  
  return false;
}

// Clean up an item name - simplified
function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  
  // Remove quantity indicators
  cleanName = cleanName.replace(/^\d+\s*[xX]\s*/, '');
  cleanName = cleanName.replace(/^\d+\s+/, '');
  
  // Remove special characters at beginning and end
  cleanName = cleanName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanName = cleanName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Remove multiple spaces
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  // Make first letter uppercase
  if (cleanName.length > 0) {
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
  
  return cleanName;
}

// Check if text is non-item text
function isNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('total') || 
         lowerText.includes('subtotal') || 
         lowerText.includes('tax') || 
         lowerText.includes('amount') || 
         lowerText.includes('price') || 
         lowerText === 'item' || 
         lowerText.length < 2;
}

// Deduplicate items
function deduplicateItems(items: Array<{name: string; amount: string; category: string}>): Array<{name: string; amount: string; category: string}> {
  const uniqueItems = new Map<string, {name: string; amount: string; category: string}>();
  
  items.forEach(item => {
    const key = item.name.toLowerCase();
    const amount = parseFloat(item.amount);
    
    // Skip invalid amounts
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    // If this item doesn't exist yet or has a higher price, update it
    if (!uniqueItems.has(key) || parseFloat(uniqueItems.get(key)!.amount) < amount) {
      uniqueItems.set(key, item);
    }
  });
  
  // Convert map back to array and sort by price (highest first)
  return Array.from(uniqueItems.values())
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
}
