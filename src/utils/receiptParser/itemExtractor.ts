
import { isNonItemText } from "./utils";
import { extractAmount } from "./amountExtractor";

/**
 * Extracts individual line items with their prices
 */
export function extractLineItems(lines: string[], fullText: string): Array<{name: string; amount: string}> {
  const items: Array<{name: string; amount: string}> = [];
  
  // Focus on the middle portion of the receipt where items usually are
  // Skip first few lines (header) and last few lines (totals, footer)
  const startIndex = Math.min(5, Math.floor(lines.length * 0.15));
  const endIndex = Math.max(lines.length - 5, Math.ceil(lines.length * 0.8));
  
  // Common patterns to identify non-item lines
  const nonItemPatterns = [
    /subtotal|tax|total|balance|due|change|cash|card|payment|credit|debit|master|visa|transaction|receipt|thank|you/i,
    /\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}/,  // Date patterns
    /^\s*\d+\s*$/,  // Just a number
    /^\s*\*+\s*$/,  // Just asterisks
    /^\s*\-+\s*$/   // Just dashes
  ];
  
  // First pass: Look for clear price patterns
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip lines that match non-item patterns
    if (nonItemPatterns.some(pattern => line.match(pattern))) {
      continue;
    }
    
    // Look for price pattern at the end of the line (e.g., $10.99, 10.99)
    // More precise price pattern
    const priceMatch = line.match(/(?:^|\s)(\$?\s*\d+\.\d{2})\s*$/);
    if (priceMatch) {
      // Extract the price and cleanup
      let price = priceMatch[1].replace('$', '').trim();
      
      // Extract the item name by removing the price part
      let itemName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim();
      
      // Clean up item name by removing quantity indicators and SKU codes
      itemName = cleanupItemName(itemName);
      
      // Skip if item name is too short or the price is zero
      if (itemName.length >= 2 && parseFloat(price) > 0 && !isNonItemText(itemName)) {
        items.push({
          name: itemName,
          amount: price
        });
      }
    }
    
    // Check for cases where the item name and price are on separate lines
    else if (i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const nextLinePriceMatch = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      
      if (nextLinePriceMatch && line.length > 2 && 
          !nonItemPatterns.some(pattern => line.match(pattern))) {
        // Clean up this item name
        let itemName = cleanupItemName(line);
        
        if (itemName.length >= 2 && !isNonItemText(itemName)) {
          items.push({
            name: itemName,
            amount: nextLinePriceMatch[1].replace('$', '').trim()
          });
          i++; // Skip the next line since we've processed it
        }
      }
    }
  }
  
  // Second pass: more aggressive approach if first pass found very few items
  if (items.length <= 1) {
    for (let i = startIndex; i < endIndex; i++) {
      const line = lines[i].trim();
      
      // Skip already processed non-item lines
      if (nonItemPatterns.some(pattern => line.match(pattern))) {
        continue;
      }
      
      const priceMatches = Array.from(line.matchAll(/\$?\s*(\d+\.\d{2})/g));
      
      if (priceMatches.length === 1) {
        const price = priceMatches[0][1];
        let itemText = line.replace(priceMatches[0][0], '').trim();
        let itemName = cleanupItemName(itemText);
        
        if (itemName.length >= 2 && parseFloat(price) > 0 && 
            !nonItemPatterns.some(pattern => itemName.match(pattern)) &&
            !isNonItemText(itemName)) {
          items.push({
            name: itemName,
            amount: price
          });
        }
      }
    }
  }
  
  // If we still found no items, create at least one item based on the total
  if (items.length === 0) {
    // Look for total amount
    const totalAmount = extractAmount(lines, fullText);
    if (totalAmount !== "0.00") {
      items.push({
        name: "Store Purchase",
        amount: totalAmount
      });
    }
  }
  
  // Remove duplicates and sort by price (largest first)
  return deduplicateItems(items);
}

/**
 * Helper function to clean up an item name
 */
function cleanupItemName(itemName: string): string {
  let cleanedName = itemName;
  
  // Remove quantity indicators
  cleanedName = cleanedName.replace(/^\d+\s*[xX]\s*/, '');  // Remove "2 x " prefix
  cleanedName = cleanedName.replace(/^\d+\s+/, '');  // Remove "2 " prefix
  
  // Remove item numbers and SKU codes
  cleanedName = cleanedName.replace(/^#\d+\s*/, ''); // Remove "#123 " prefix
  cleanedName = cleanedName.replace(/\s+\d+$/, '');  // Remove trailing numbers
  cleanedName = cleanedName.replace(/\s{2,}/g, ' ');  // Remove multiple spaces
  
  // Remove special characters at beginning and end
  cleanedName = cleanedName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanedName = cleanedName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Make first letter uppercase for better appearance
  if (cleanedName.length > 0) {
    cleanedName = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }
  
  return cleanedName;
}

/**
 * Deduplicate and clean up extracted items
 */
function deduplicateItems(items: Array<{name: string; amount: string}>): Array<{name: string; amount: string}> {
  // Create a map to track unique items, using item name as key
  const uniqueItems = new Map<string, {name: string; amount: string}>();
  
  // Process each item
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
