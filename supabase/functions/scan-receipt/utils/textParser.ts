
import { formatPrice, capitalizeFirstLetter, guessCategory } from "./formatting.ts";
import { extractDate } from "./dateExtractor.ts";
import { cleanItemText } from "./items/itemCleanup.ts";

// Parse receipt text into a structured format
export function parseReceiptText(text: string) {
  console.log("Starting receipt text parsing");
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`Parsing ${lines.length} lines of text`);
  
  const result = [];
  
  // Extract date from receipt
  const date = extractDate(text) || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  console.log("Extracted date:", date);
  
  // Try to extract store name
  const storeName = extractStoreName(lines);
  
  // First pass: extract clear item-price patterns
  const itemsFirstPass = extractItemsFirstPass(lines);
  
  // Second pass: more aggressive pattern matching if needed
  const items = itemsFirstPass.length > 0 ? itemsFirstPass : extractItemsSecondPass(lines);
  
  // Process and clean up the extracted items
  for (const item of items) {
    if (item.name.length >= 2 && parseFloat(item.price) > 0) {
      result.push({
        date: date,
        name: capitalizeFirstLetter(cleanItemName(item.name)),
        amount: formatPrice(parseFloat(item.price)),
        category: guessCategory(item.name),
        store: storeName
      });
    }
  }
  
  // If we didn't find any items using any patterns, create a fallback item
  if (result.length === 0) {
    console.log("No items found, creating fallback item");
    result.push({
      date: date,
      name: "Store Purchase",
      amount: "10.00",
      category: "Shopping",
      store: storeName
    });
  }
  
  return result;
}

// Try to extract store name from the receipt
function extractStoreName(lines: string[]) {
  // Look at the first few lines for store name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip very short lines
    if (line.length < 3) continue;
    
    // Skip lines with common non-store patterns
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you/i)) continue;
    
    // Potential store name - uppercase words are often store names at the top
    if (line.toUpperCase() === line && line.length > 3) {
      return capitalizeFirstLetter(line.toLowerCase());
    }
    
    // Another pattern - first line that's not a date, number, etc.
    if (!line.match(/^\d/) && !line.match(/^[A-Z]{1,3}$/) && line.length > 3) {
      return capitalizeFirstLetter(line);
    }
  }
  
  return "Store";  // Default if no store name found
}

// First pass: extract items with clear price patterns
function extractItemsFirstPass(lines: string[]) {
  const items = [];
  
  // These patterns detect items with their prices
  const itemPricePatterns = [
    // Item followed by price at end of line
    /^(.+?)\s+\$?(\d+\.\d{2})$/,
    // Item with price anywhere in the line
    /^(.+?)\s+\$?(\d+\.\d{2})/,
    // Quantity x Item @ price
    /(\d+)\s*[xX]\s*(.+?)\s*@\s*\$?(\d+\.\d{2})/,
  ];
  
  // Skip headers and footers, focus on the middle portion of the receipt
  const startIndex = Math.min(3, Math.floor(lines.length * 0.1));
  const endIndex = Math.max(lines.length - 3, Math.ceil(lines.length * 0.9));
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip lines that are likely to be headers, footers, or totals
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Try all item-price patterns
    let matched = false;
    
    for (const pattern of itemPricePatterns) {
      const match = line.match(pattern);
      if (match) {
        // Handle quantity x item pattern
        if (pattern.toString().includes('[xX]')) {
          const qty = parseInt(match[1]);
          const name = match[2];
          const price = parseFloat(match[3]) * qty;
          
          items.push({
            name: `${name} (${qty}x)`,
            price: price.toFixed(2)
          });
        } else {
          // Standard item-price pattern
          const name = match[1];
          const price = match[2];
          
          items.push({
            name,
            price
          });
        }
        
        matched = true;
        break;
      }
    }
    
    // Look for potential split item-price across lines
    if (!matched && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const priceMatch = nextLine.match(/^\s*\$?(\d+\.\d{2})\s*$/);
      
      if (priceMatch && !shouldSkipLine(line)) {
        items.push({
          name: line,
          price: priceMatch[1]
        });
        i++; // Skip the price line
      }
    }
  }
  
  return items;
}

// Second pass: more aggressive pattern matching
function extractItemsSecondPass(lines: string[]) {
  const items = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip non-item lines
    if (shouldSkipLine(line)) {
      continue;
    }
    
    // Look for any price in the line
    const priceMatches = line.match(/\$?\s*(\d+\.\d{2})/g);
    
    if (priceMatches && priceMatches.length > 0) {
      const price = priceMatches[priceMatches.length - 1].replace('$', '').trim();
      
      // Extract the item name by removing or ignoring the price part
      let namePart = line;
      
      // Remove all price occurrences from the line
      for (const priceMatch of priceMatches) {
        namePart = namePart.replace(priceMatch, '');
      }
      
      // Clean up the name
      namePart = namePart.trim().replace(/\s{2,}/g, ' ');
      
      if (namePart.length >= 2 && parseFloat(price) > 0) {
        items.push({
          name: namePart,
          price
        });
      }
    }
  }
  
  return items;
}

// Improved function to clean up item name
function cleanItemName(name: string) {
  let cleanedName = name;
  
  // Remove quantity indicators
  cleanedName = cleanedName.replace(/^\d+\s*[xX]\s*/, '');  // Remove "2 x " prefix
  cleanedName = cleanedName.replace(/^\d+\s+/, '');  // Remove "2 " prefix
  
  // Remove item numbers and SKU codes
  cleanedName = cleanedName.replace(/^#\d+\s*/, ''); // Remove "#123 " prefix
  cleanedName = cleanedName.replace(/^[a-z0-9]{6,}\s+/i, ''); // Remove SKU/UPC codes
  
  // Remove prices within the name
  cleanedName = cleanedName.replace(/\s+\$?\d+\.\d{2}([^\d]|$)/g, '$1');
  
  // Remove special characters and extra spaces
  cleanedName = cleanedName.replace(/[*#@]|\s{2,}/g, ' ').trim();
  
  // Remove specific non-item words that might have made it through
  const nonItemWords = /subtot|total|tax|change|discount|savings|deposit|payment|thank you/i;
  if (nonItemWords.test(cleanedName)) {
    return '';
  }
  
  // Truncate very long names (likely not real items but paragraphs of text)
  if (cleanedName.length > 50) {
    cleanedName = cleanedName.substring(0, 50) + '...';
  }
  
  return cleanedName;
}

// Check if a line should be skipped (not an item)
function shouldSkipLine(line: string) {
  const lowerLine = line.toLowerCase();
  
  // Common non-item keywords
  const nonItemKeywords = [
    'total', 'subtotal', 'tax', 'change', 'cash', 'card', 'credit', 'debit',
    'balance', 'due', 'payment', 'receipt', 'order', 'transaction', 'thank you',
    'welcome', 'discount', 'savings', 'points', 'rewards', 'store', 'tel:',
    'phone', 'address', 'website', 'www', 'http', 'promotion', 'member'
  ];
  
  // Check for non-item keywords
  for (const keyword of nonItemKeywords) {
    if (lowerLine.includes(keyword)) {
      return true;
    }
  }
  
  // Skip lines that are just numbers, dashes, etc.
  if (lowerLine.match(/^\d+$/) || lowerLine.match(/^[-=*]+$/)) {
    return true;
  }
  
  // Skip very short lines (likely not items)
  if (lowerLine.length < 3) {
    return true;
  }
  
  return false;
}

// Create a namespace for external modules to avoid name collisions
export const textUtils = {
  cleanItemName,
  shouldSkipLine,
  extractStoreName
};
