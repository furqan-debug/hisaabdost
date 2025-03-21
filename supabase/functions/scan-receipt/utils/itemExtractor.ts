// Functions for extracting line items from receipt text

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Simple item pattern for grocery/supermarket receipts
  // Format like "Item Name          12.34" or "Item Name     $12.34"
  const itemPattern = /^([A-Za-z\s\&\-\']+\w)[\s\.]+(\d+\.\d{2})$/;
  const itemPricePattern = /^([A-Za-z\s\&\-\']+\w)[\s\.]+\$?(\d+\.\d{2})$/;
  
  // More specific pattern for items with weight/quantity indicators
  // Format like "Item Name 1lb       12.34" or "Item 12pk       $12.34"
  const itemWithUnitPattern = /^([A-Za-z\s\&\-\']+\w)\s+(\d+(?:lb|pk|oz|kg|g))[\s\.]+\$?(\d+\.\d{2})$/;
  
  // Process each line looking for patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    
    console.log(`Checking line: "${line}"`);
    
    // Skip lines that are clearly headers, footers, or metadata
    if (shouldSkipLine(line)) {
      console.log(`Skipping line: "${line}"`);
      continue;
    }
    
    // Check for item with unit pattern first (more specific)
    const unitMatch = line.match(itemWithUnitPattern);
    if (unitMatch) {
      const itemName = unitMatch[1].trim() + " " + unitMatch[2].trim();
      const price = unitMatch[3];
      console.log(`Found item with unit: "${itemName}" for $${price}`);
      
      items.push({
        name: cleanupItemName(itemName),
        amount: price,
        category: guessCategory(itemName)
      });
      continue;
    }
    
    // Check for standard item pattern
    const match = line.match(itemPattern) || line.match(itemPricePattern);
    if (match) {
      const itemName = match[1].trim();
      const price = match[2];
      console.log(`Found standard item: "${itemName}" for $${price}`);
      
      items.push({
        name: cleanupItemName(itemName),
        amount: price,
        category: guessCategory(itemName)
      });
      continue;
    }
    
    // Try to match more complex patterns with split lines or formatting
    const priceAtEndMatch = line.match(/^(.+?)\s+(\d+\.\d{2})$/);
    if (priceAtEndMatch && !line.match(/total|subtotal|tax|balance|due/i)) {
      const itemName = priceAtEndMatch[1].trim();
      const price = priceAtEndMatch[2];
      
      // Skip short or non-descriptive names
      if (itemName.length > 3 && !isNumeric(itemName)) {
        console.log(`Found complex item: "${itemName}" for $${price}`);
        items.push({
          name: cleanupItemName(itemName),
          amount: price,
          category: guessCategory(itemName)
        });
      }
    }
  }
  
  console.log(`Extracted ${items.length} items from receipt`);
  
  // If we found no items, try a more aggressive approach
  if (items.length === 0) {
    console.log("No items found with standard patterns, trying backup extraction");
    extractItemsAggressively(lines, 0, lines.length, items);
  }
  
  return items;
}

// Check if a line should be skipped when searching for items
export function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Skip common receipt headers and metadata
  if (lowerLine.includes("store #") || 
      lowerLine.includes("receipt") ||
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
      lowerLine.match(/^\=+$/) || // Just equals signs
      lowerLine.match(/^\-+$/) || // Just hyphens
      lowerLine.match(/^\*+$/) || // Just asterisks
      lowerLine.match(/^[\=\-\*]+$/) || // Just separator characters
      lowerLine.match(/^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$/)) { // Just a date
    return true;
  }
  
  return false;
}

// Clean up an item name by removing common prefixes and special characters
export function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  
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
  
  // Ensure proper capitalization (first letter of each word)
  cleanName = cleanName.replace(/\w\S*/g, (txt) => {
    // If the word is all uppercase, keep it that way
    if (txt === txt.toUpperCase()) {
      return txt;
    }
    // Otherwise capitalize first letter, lowercase the rest
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
  
  return cleanName;
}

// Try a more aggressive approach to extract items from receipt text
export function extractItemsAggressively(
  lines: string[], 
  startIndex: number, 
  endIndex: number, 
  items: Array<{name: string; amount: string; category: string}>
): void {
  // For supermarket receipts, try to match the pattern where items and prices are aligned
  console.log("Using aggressive item extraction");
  
  // Start at a reasonable point (skip the header)
  const startLine = Math.max(5, startIndex);
  const endLine = Math.min(endIndex, lines.length - 5);
  
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i].trim();
    
    // Skip already processed lines or clear non-item lines
    if (shouldSkipLine(line) || line.length < 5) {
      continue;
    }
    
    // Look for price-like patterns at the end of the line
    const priceMatch = line.match(/\s+(\d+\.\d{2})$/);
    if (priceMatch) {
      const price = priceMatch[1];
      
      // Get the text before the price as the item name
      let itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
      
      // Clean up the item name
      itemName = cleanupItemName(itemName);
      
      if (itemName && price && 
          parseFloat(price) > 0 && 
          !isCommonNonItemText(itemName) && 
          itemName.length > 2) {
        console.log(`[Aggressive] Found item: "${itemName}" with price: $${price}`);
        items.push({
          name: itemName,
          amount: price,
          category: guessCategory(itemName)
        });
      }
    }
  }
}

// Guess category based on item name
function guessCategory(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Grocery categories
  if (lowerName.includes("eggs") || 
      lowerName.includes("milk") || 
      lowerName.includes("cheese") || 
      lowerName.includes("yogurt") || 
      lowerName.includes("butter") || 
      lowerName.includes("cream")) {
    return "Groceries";
  }
  
  // Produce/vegetables/fruits
  if (lowerName.includes("tomato") || 
      lowerName.includes("banana") || 
      lowerName.includes("apple") || 
      lowerName.includes("lettuce") || 
      lowerName.includes("potato") || 
      lowerName.includes("onion") || 
      lowerName.includes("pepper") ||
      lowerName.includes("aubergine") ||
      lowerName.includes("fruit") ||
      lowerName.includes("vegetable")) {
    return "Groceries";
  }
  
  // Meat and protein
  if (lowerName.includes("chicken") || 
      lowerName.includes("beef") || 
      lowerName.includes("pork") || 
      lowerName.includes("fish") || 
      lowerName.includes("tuna") || 
      lowerName.includes("meat") || 
      lowerName.includes("steak") ||
      lowerName.includes("breast")) {
    return "Groceries";
  }
  
  // Snacks and treats
  if (lowerName.includes("cookie") || 
      lowerName.includes("cracker") || 
      lowerName.includes("chip") || 
      lowerName.includes("chocolate") || 
      lowerName.includes("candy") || 
      lowerName.includes("snack")) {
    return "Groceries";
  }
  
  // Household items
  if (lowerName.includes("paper") || 
      lowerName.includes("toilet") || 
      lowerName.includes("wipe") || 
      lowerName.includes("napkin") || 
      lowerName.includes("towel") || 
      lowerName.includes("soap") || 
      lowerName.includes("detergent") ||
      lowerName.includes("clean")) {
    return "Household";
  }
  
  // Default to groceries for supermarket receipts
  return "Groceries";
}

// Helper function to check if a string is numeric
function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
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
