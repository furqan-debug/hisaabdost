// Functions for extracting line items from receipt text

// Extract individual line items from receipt text
export function extractLineItems(lines: string[]): Array<{name: string; amount: string; category: string}> {
  const items: Array<{name: string; amount: string; category: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Skip receipt header (typically first 5-10 lines)
  const startLine = Math.min(10, Math.floor(lines.length * 0.2));
  
  // Skip receipt footer (typically last 5-10 lines)
  const endLine = Math.max(lines.length - 10, Math.ceil(lines.length * 0.8));
  
  // Process the middle portion where items are usually listed
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i].trim();
    if (line.length < 3) continue;  // Skip very short lines
    
    // Skip lines that are clearly headers, footers, or metadata
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Check for item with price pattern
    // Looking for patterns like:
    // 1. "Item name   12.34"
    // 2. "Item name   $12.34"
    // 3. "Item name......12.34"
    // 4. "Item name 1pc  12.34"
    
    // First try to find price at the end
    const priceMatch = line.match(/[\s\.]+\$?(\d+\.\d{2})$/);
    if (priceMatch) {
      const price = priceMatch[1];
      const priceValue = parseFloat(price);
      
      // Only consider reasonable prices (between 0.10 and 1000.00)
      if (priceValue >= 0.10 && priceValue <= 1000.00) {
        // Extract item name by removing the price part
        const itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
        
        // Only add items with reasonable names (not too short)
        if (itemName.length >= 2 && !isNonItemText(itemName)) {
          items.push({
            name: cleanupItemName(itemName),
            amount: price,
            category: guessCategory(itemName)
          });
        }
      }
    }
  }
  
  // If we found no items, try a more aggressive approach
  if (items.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip non-item lines
      if (shouldSkipLine(line) || line.length < 3) {
        continue;
      }
      
      // Look for any price-like pattern
      const priceMatches = line.match(/\$?(\d+\.\d{2})/g);
      if (priceMatches && priceMatches.length > 0) {
        // Get the last price in the line (usually the item price)
        const priceStr = priceMatches[priceMatches.length - 1];
        const price = priceStr.replace('$', '');
        const priceValue = parseFloat(price);
        
        // Only consider reasonable prices (between 0.10 and 1000.00)
        if (priceValue >= 0.10 && priceValue <= 1000.00) {
          // Get text before the price as the item name
          let itemName = line.substring(0, line.lastIndexOf(priceStr)).trim();
          
          // Remove additional price patterns that might be quantity or weight indicators
          itemName = itemName.replace(/\$?(\d+\.\d{2})/g, '').trim();
          
          // Clean up common prefixes like item numbers
          itemName = itemName.replace(/^[\d\.]+\s+/, '').trim();
          
          if (itemName.length >= 2 && !isNonItemText(itemName)) {
            items.push({
              name: cleanupItemName(itemName),
              amount: price,
              category: guessCategory(itemName)
            });
          }
        }
      }
    }
  }
  
  // Deduplicate items - keep items with unique names
  const uniqueItems = new Map<string, {name: string; amount: string; category: string}>();
  
  items.forEach(item => {
    const key = item.name.toLowerCase();
    
    // If this item doesn't exist yet or has a higher price than existing one
    if (!uniqueItems.has(key) || parseFloat(uniqueItems.get(key)!.amount) < parseFloat(item.amount)) {
      uniqueItems.set(key, item);
    }
  });
  
  // Return as array sorted by highest amount first
  return Array.from(uniqueItems.values())
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
}

// Check if a line should be skipped when searching for items
function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Skip common receipt headers and metadata
  if (lowerLine.includes("receipt") ||
      lowerLine.includes("invoice") ||
      lowerLine.includes("store #") || 
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
      lowerLine.includes("time") ||
      lowerLine.includes("order") ||
      lowerLine.includes("cashier") ||
      lowerLine.includes("customer") ||
      lowerLine.includes("discount") ||
      lowerLine.includes("coupon") ||
      lowerLine.match(/^\d+$/) || // Just a number
      lowerLine.match(/^\=+$/) || // Just equals signs
      lowerLine.match(/^\-+$/) || // Just hyphens
      lowerLine.match(/^\*+$/)) { // Just asterisks
    return true;
  }
  
  return false;
}

// Clean up an item name by removing common prefixes and special characters
function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  
  // Remove quantity/weight indicators
  cleanName = cleanName.replace(/^\d+\s*[x×]\s*/, '');  // Remove "2 x " prefix
  cleanName = cleanName.replace(/\d+\s*[x×]\s*/, ' ');  // Remove "2 x " anywhere
  cleanName = cleanName.replace(/\d+\s*(lb|kg|g|oz)\b/gi, ''); // Remove weight
  
  // Remove item codes and numeric prefixes
  cleanName = cleanName.replace(/^#\s*\d+\s*/, '');  // Item numbers
  cleanName = cleanName.replace(/^[A-Z]+\d+\s+/, ''); // Item codes like SKU123
  
  // Remove special characters but keep apostrophes and hyphens
  cleanName = cleanName.replace(/[*#$@%()]/g, '');
  
  // Remove multiple spaces and trim
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  // Proper case the name (uppercase first letter of each word)
  cleanName = cleanName.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
  
  return cleanName;
}

// Guess category based on item name
function guessCategory(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Food categories
  if (lowerName.includes("milk") || 
      lowerName.includes("bread") || 
      lowerName.includes("cheese") || 
      lowerName.includes("yogurt") || 
      lowerName.includes("egg") || 
      lowerName.includes("cereal") ||
      lowerName.includes("juice")) {
    return "Groceries";
  }
  
  // Produce
  if (lowerName.includes("apple") || 
      lowerName.includes("banana") || 
      lowerName.includes("orange") || 
      lowerName.includes("tomato") || 
      lowerName.includes("lettuce") || 
      lowerName.includes("vegetable") ||
      lowerName.includes("fruit")) {
    return "Groceries";
  }
  
  // Meat
  if (lowerName.includes("chicken") || 
      lowerName.includes("beef") || 
      lowerName.includes("pork") || 
      lowerName.includes("meat") || 
      lowerName.includes("fish") || 
      lowerName.includes("seafood")) {
    return "Groceries";
  }
  
  // Restaurant items
  if (lowerName.includes("burger") || 
      lowerName.includes("pizza") || 
      lowerName.includes("sandwich") || 
      lowerName.includes("meal") || 
      lowerName.includes("fries") || 
      lowerName.includes("coffee") ||
      lowerName.includes("drink") ||
      lowerName.includes("soda")) {
    return "Restaurant";
  }
  
  // Household items
  if (lowerName.includes("soap") || 
      lowerName.includes("paper") || 
      lowerName.includes("cleaner") || 
      lowerName.includes("detergent") || 
      lowerName.includes("toilet") || 
      lowerName.includes("tissue")) {
    return "Household";
  }
  
  // Default to Shopping for most other items
  return "Shopping";
}

// Check if text is commonly found in receipts but isn't an actual item
function isNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes("total") || 
         lowerText.includes("subtotal") || 
         lowerText.includes("tax") || 
         lowerText.includes("change") || 
         lowerText.includes("balance") || 
         lowerText === "item" || 
         lowerText === "price" || 
         lowerText === "amount" || 
         lowerText === "qty" || 
         lowerText === "quantity";
}
