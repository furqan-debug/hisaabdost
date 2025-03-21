
// Functions for extracting line items from receipt text

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Look for patterns that indicate item rows with prices
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or section headers
    if (line.length < 3 || shouldSkipLine(line)) continue;
    
    // Pattern: Look for text followed by a price (e.g., "Milk 1.80" or "Large Eggs 6.17")
    // This is the most common receipt format
    const pricePattern = /^(.+?)\s+(\d+\.\d{2})$/;
    const match = line.match(pricePattern);
    
    if (match) {
      const name = cleanupItemName(match[1]);
      const price = match[2];
      
      // Simple validation
      if (name.length >= 2 && !isNonItemText(name) && parseFloat(price) > 0) {
        items.push({
          name: name,
          amount: price,
          category: guessCategoryFromItemName(name)
        });
        continue;
      }
    }
    
    // Alternative pattern: Look for any line with a price at the end
    // This catches items with more complex formats
    const altMatch = line.match(/(.+?)\s+(\d+\.\d{2})$/);
    if (altMatch) {
      const name = cleanupItemName(altMatch[1]);
      const price = altMatch[2];
      
      if (name.length >= 2 && !isNonItemText(name) && parseFloat(price) > 0) {
        items.push({
          name: name,
          amount: price,
          category: guessCategoryFromItemName(name)
        });
      }
    }
  }
  
  // If we found no items with the direct pattern, try a more flexible approach
  if (items.length === 0) {
    // Fall back to the original extraction logic
    return fallbackItemExtraction(lines);
  }
  
  console.log(`Extracted ${items.length} items from receipt`);
  
  // Return deduped items sorted by price (largest first)
  return deduplicateItems(items);
}

// Fallback extraction method if the direct pattern matching fails
function fallbackItemExtraction(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  
  // Find the range where items are typically listed
  let startLine = 0;
  let endLine = lines.length;
  
  // Look for sections that typically mark the beginning of items
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("item") || 
        line.includes("qty") || 
        line.includes("description") || 
        line.includes("product") ||
        line.match(/^[\-=]{3,}$/)) {
      startLine = i + 1;
      break;
    }
  }
  
  // Look for sections that typically mark the end of items
  for (let i = Math.floor(lines.length * 0.6); i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("subtotal") || 
        line.includes("sub-total") || 
        line.includes("tax") || 
        line.includes("total") ||
        line.match(/^[\-=]{3,}$/)) {
      endLine = i;
      break;
    }
  }
  
  // Process the middle portion where items are usually listed
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i].trim();
    if (line.length < 3) continue;  // Skip very short lines
    
    // Skip lines that are clearly headers, footers, or metadata
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Look for price pattern at the end of the line (e.g., 12.34 or $12.34)
    const priceMatch = line.match(/(\$?\s*\d+\.\d{2})(?:\s*$)/);
    if (priceMatch) {
      const price = priceMatch[1].replace('$', '').trim();
      const priceValue = parseFloat(price);
      
      // Only consider reasonable prices
      if (priceValue >= 0.10 && priceValue <= 500.00) {
        // Extract item name by removing the price part
        let itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
        
        // Clean up the item name
        itemName = cleanupItemName(itemName);
        
        // Only add items with reasonable names
        if (itemName.length >= 2 && !isNonItemText(itemName)) {
          items.push({
            name: itemName,
            amount: price,
            category: guessCategoryFromItemName(itemName)
          });
        }
      }
    }
  }
  
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
  
  // Skip lines that are just decorative
  if (line.match(/^[\-=*]{3,}$/)) {
    return true;
  }
  
  return false;
}

// Clean up an item name
function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  
  // Remove quantity indicators
  cleanName = cleanName.replace(/^\d+\s*[xX]\s*/, '');
  cleanName = cleanName.replace(/^\d+\s+/, '');
  
  // Remove SKU codes/numbers
  cleanName = cleanName.replace(/\d{5,}/, '');
  
  // Remove special characters at beginning and end
  cleanName = cleanName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanName = cleanName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Remove multiple spaces
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
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

// Guess the category based on the item name
function guessCategoryFromItemName(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Food items
  if (lowerName.includes('milk') || 
      lowerName.includes('egg') || 
      lowerName.includes('cheese') ||
      lowerName.includes('yogurt') ||
      lowerName.includes('bread') ||
      lowerName.includes('fruit') ||
      lowerName.includes('vegetable') ||
      lowerName.includes('meat') ||
      lowerName.includes('chicken') ||
      lowerName.includes('fish') ||
      lowerName.includes('tuna') ||
      lowerName.includes('banana') ||
      lowerName.includes('tomato')) {
    return "Groceries";
  }
  
  // Household items
  if (lowerName.includes('paper') || 
      lowerName.includes('wipe') || 
      lowerName.includes('clean') ||
      lowerName.includes('detergent') ||
      lowerName.includes('soap') ||
      lowerName.includes('toilet') ||
      lowerName.includes('baby')) {
    return "Household";
  }
  
  // Default to Groceries for a supermarket receipt
  return "Groceries";
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
