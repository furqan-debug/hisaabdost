
// Functions for extracting line items from receipt text

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Define patterns for item detection
  const patterns = [
    // Pattern: Item name followed by price (most common)
    // Example: "Milk 1.80" or "Large Eggs 6.17"
    /^(.+?)\s+(\d+\.\d{2})$/,
    
    // Pattern: Item with quantity indicator followed by price
    // Example: "2 x Milk 3.60"
    /^(?:\d+\s*[xX]\s*)?(.+?)\s+(\d+\.\d{2})$/,
    
    // Pattern: Item with SKU/code followed by price
    // Example: "Milk #12345 1.80"
    /^(.+?)(?:\s+#\d+)?\s+(\d+\.\d{2})$/,
    
    // More flexible pattern for capturing items with price at the end
    /(.+?)\s+\$?(\d+\.\d{2})$/,
    
    // Pattern for items with a "$" prefix
    /(.+?)\s+\$(\d+\.\d{2})$/
  ];
  
  // Filter out receipt header and footer sections
  let startLineIndex = 0;
  let endLineIndex = lines.length - 1;
  
  // Look for section markers that indicate where items begin
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("item") || 
        line.includes("description") || 
        line.includes("qty") || 
        line.includes("quantity") ||
        line.match(/^[\-=]{3,}$/)) {
      startLineIndex = i + 1;
      break;
    }
  }
  
  // Look for section markers that indicate where items end
  for (let i = Math.floor(lines.length * 0.5); i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("subtotal") || 
        line.includes("sub-total") || 
        line.includes("tax") || 
        line.includes("total") ||
        line.match(/^[\-=]{3,}$/)) {
      endLineIndex = i - 1;
      break;
    }
  }
  
  // Process the section containing item lines
  for (let i = startLineIndex; i <= endLineIndex; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or known non-item text
    if (line.length < 3 || shouldSkipLine(line)) {
      continue;
    }
    
    // Try each pattern to extract items
    let itemFound = false;
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name = cleanupItemName(match[1]);
        const price = match[2];
        
        // Validation: check name is meaningful and price is valid
        if (name.length >= 2 && !isNonItemText(name) && parseFloat(price) > 0) {
          items.push({
            name: name,
            amount: price,
            category: guessCategoryFromItemName(name)
          });
          itemFound = true;
          break;
        }
      }
    }
    
    // If we couldn't match with standard patterns, try more aggressive patterns
    if (!itemFound) {
      // Look for any price pattern in the line
      const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (priceMatch) {
        // Extract the price
        const price = priceMatch[1];
        // Extract the item name by removing the price part
        let nameText = line.replace(priceMatch[0], '').trim();
        nameText = cleanupItemName(nameText);
        
        // Only add if we have a reasonable name and price
        if (nameText.length >= 2 && !isNonItemText(nameText) && parseFloat(price) > 0) {
          items.push({
            name: nameText,
            amount: price,
            category: guessCategoryFromItemName(nameText)
          });
        }
      }
    }
  }
  
  // If we didn't find any items with direct matching, try the fallback method
  if (items.length === 0) {
    console.log("No items found with direct matching, trying fallback method");
    return fallbackItemExtraction(lines);
  }
  
  console.log(`Extracted ${items.length} items from receipt`);
  
  // Return deduped items sorted by price
  return deduplicateItems(items);
}

// Fallback extraction method if the direct pattern matching fails
function fallbackItemExtraction(lines: string[]): Array<{name: string; amount: string; category: string}> {
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
      lowerLine.includes("time") ||
      lowerLine.includes("welcome") ||
      lowerLine.includes("customer") ||
      lowerLine.includes("copy") ||
      lowerLine.includes("store:") ||
      lowerLine.includes("tran:") ||
      lowerLine.includes("phone") ||
      lowerLine.includes("transaction")) {
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
  cleanName = cleanName.replace(/\s*#\d+/, '');
  cleanName = cleanName.replace(/\d{5,}/, '');
  
  // Remove department/category prefixes
  cleanName = cleanName.replace(/^(grocery|produce|dairy|bakery|meat|deli):\s*/i, '');
  
  // Remove special characters at beginning and end
  cleanName = cleanName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanName = cleanName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Remove multiple spaces
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
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
         lowerText.includes('description') ||
         lowerText.includes('quantity') ||
         lowerText.length < 2 ||
         lowerText.includes('date') ||
         lowerText.includes('time') ||
         lowerText.includes('receipt') ||
         lowerText.includes('store') ||
         lowerText.includes('customer') ||
         lowerText.includes('copy') ||
         lowerText.includes('thank you');
}

// Guess the category based on the item name
function guessCategoryFromItemName(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Gas and transportation
  if (lowerName.includes('gas') ||
      lowerName.includes('fuel') ||
      lowerName.includes('diesel') ||
      lowerName.includes('unleaded') ||
      lowerName.includes('premium') ||
      lowerName.includes('litre') ||
      lowerName.includes('gallon')) {
    return "Transportation";
  }
  
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
  
  // Default to Shopping
  return "Shopping";
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
