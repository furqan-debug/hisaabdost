
import { extractMerchant } from "./receiptParser/merchantExtractor";

// Improved Date Extraction
export function extractDate(text: string): string | null {
  // Common date formats to try matching against
  const datePatterns = [
    /\b(\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b/, // YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{4})\b/, // MM-DD-YYYY or MM/DD/YYYY or MM.DD.YYYY
    /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2})\b/, // MM-DD-YY or MM/DD/YY or MM.DD.YY
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{2,4}\b/i, // Month name, day, year
    /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4}\b/i, // day, Month name, year
    /\bDate:\s*([a-zA-Z0-9\-\.\/,\s]+)\b/i, // "Date:" prefix with various formats
    /\b(Yesterday|Today)\b/i // Special cases
  ];
  
  // Try each pattern
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Handle special cases like "Today" or "Yesterday"
      if (match[1].toLowerCase() === 'today') {
        return new Date().toISOString().split('T')[0];
      } else if (match[1].toLowerCase() === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
      }
      
      // Try to parse the date
      try {
        // Handle various formats
        const dateParts = match[1].split(/[-\/\.]/);
        let dateObj;
        
        // Handle different date formats based on pattern
        if (pattern.toString().includes('\\d{4}[-/')) {
          // YYYY-MM-DD format
          dateObj = new Date(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2])
          );
        } else if (pattern.toString().includes('Jan|Feb|Mar')) {
          // Text month format - try direct parsing
          dateObj = new Date(match[1]);
        } else {
          // MM-DD-YYYY format
          const year = dateParts[2].length === 2 ? 2000 + parseInt(dateParts[2]) : parseInt(dateParts[2]);
          dateObj = new Date(
            year, 
            parseInt(dateParts[0]) - 1, 
            parseInt(dateParts[1])
          );
        }
        
        // Validate the date - if it's valid, return it in ISO format
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        // If parsing fails, continue to next pattern
        continue;
      }
      
      return match[1];
    }
  }
  
  // No valid date found, return today's date
  return new Date().toISOString().split('T')[0];
}

// Improved Amount Extraction
export function extractAmounts(lines: string[]): { name: string; amount: number }[] {
  const items: { name: string; amount: number }[] = [];
  
  // Various patterns to match item-price pairs
  const patterns = [
    // Standard pattern with name and price separated by space(s)
    /([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/,
    
    // Pattern with quantity, like "2 x Item $9.99"
    /(\d+)\s*[xX]\s*([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/,
    
    // Pattern for item with price at start of line
    /^([\$]?[\d,]+\.?\d{0,2})\s+([\w\s\&\-\.,'"\(\)]+?)$/,
    
    // Pattern with quantity at start, like "2 Item $9.99"
    /^(\d+)\s+([\w\s\&\-\.,'"\(\)]+?)\s+([\$]?[\d,]+\.?\d{0,2})$/
  ];
  
  for (const line of lines) {
    let matched = false;
    
    // Skip lines that are likely not items
    if (line.match(/total|subtotal|tax|change|cash|card|date|time|thank/i)) {
      continue;
    }
    
    // Try each pattern
    for (const pattern of patterns) {
      const match = line.match(pattern);
      
      if (match) {
        let itemName, amount;
        
        // Process based on pattern type
        if (pattern.toString().includes('\\d+\\s*[xX]\\s*')) {
          // Pattern with "2 x Item $9.99"
          const qty = parseInt(match[1]);
          itemName = `${match[2].trim()} (${qty}x)`;
          amount = parseFloat(match[3].replace(/[$,]/g, ''));
        } else if (pattern.toString().includes('^([\\$]?[\\d,]+')) {
          // Pattern with price first
          itemName = match[2].trim();
          amount = parseFloat(match[1].replace(/[$,]/g, ''));
        } else if (pattern.toString().includes('^(\\d+)\\s+([\\w\\s')) {
          // Pattern with quantity at start without 'x'
          const qty = parseInt(match[1]);
          itemName = `${match[2].trim()} (${qty}x)`;
          amount = parseFloat(match[3].replace(/[$,]/g, ''));
        } else {
          // Standard pattern
          itemName = match[1].trim();
          amount = parseFloat(match[2].replace(/[$,]/g, ''));
        }
        
        // Clean item name
        itemName = cleanItemName(itemName);
        
        // Add if valid
        if (itemName && !isNaN(amount) && amount > 0) {
          items.push({ name: itemName, amount });
          matched = true;
          break;
        }
      }
    }
    
    // If no pattern matched but line has a number with decimal point
    // that looks like a price, try a more relaxed approach
    if (!matched) {
      const priceMatch = line.match(/([\d,]+\.\d{2})/);
      if (priceMatch) {
        const amount = parseFloat(priceMatch[1].replace(',', ''));
        if (!isNaN(amount) && amount > 0) {
          // Get everything before the price as the item name
          const priceIndex = line.indexOf(priceMatch[1]);
          if (priceIndex > 3) { // Make sure there's enough text for a name
            let itemName = line.substring(0, priceIndex).trim();
            itemName = cleanItemName(itemName);
            
            if (itemName) {
              items.push({ name: itemName, amount });
            }
          }
        }
      }
    }
  }
  
  return items;
}

// Helper to clean up item names
function cleanItemName(name: string): string {
  // Trim spaces, remove excess punctuation
  let cleaned = name.trim()
    .replace(/\s{2,}/g, ' ')                      // Remove extra spaces
    .replace(/^[\d\s]*[xX*]?\s*/i, '')            // Remove leading quantity indicators
    .replace(/\s*\(\d+[xX*]\)$/i, '')             // Remove trailing quantity indicators
    .replace(/[\.,;:]+$/, '')                      // Remove trailing punctuation
    .replace(/\$+/g, '')                          // Remove dollar signs
    .replace(/^[^a-zA-Z0-9]+/, '')                // Remove leading non-alphanumeric chars
    .replace(/Item\s*#?\d+\s*/i, '');             // Remove "Item #N" references
  
  // Remove common prefixes
  const prefixes = ['qty', 'quantity', 'sku', 'item', 'product'];
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(new RegExp(`^${prefix}\\s*:?\\s*`, 'i'), '');
  }
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

// Auto-Categorization of Expenses
export function categorizeExpense(itemName: string): string {
  const categories: Record<string, string[]> = {
    Groceries: ["milk", "bread", "eggs", "supermarket", "grocery", "food", "produce", "meat", "dairy", "vegetable", "fruit"],
    Dining: ["burger", "pizza", "coffee", "restaurant", "cafe", "meal", "lunch", "dinner", "breakfast", "drink"],
    Transport: ["uber", "taxi", "gas", "bus", "train", "fare", "parking", "subway", "toll", "transport"],
    Shopping: ["clothing", "electronics", "mall", "amazon", "store", "shop", "retail", "item", "purchase"],
    Health: ["doctor", "medicine", "pharmacy", "healthcare", "medical", "prescription", "health", "vitamin", "drug"],
    Entertainment: ["movie", "ticket", "event", "game", "entertainment", "concert", "show", "theater", "cinema"],
    Utilities: ["electricity", "water", "gas", "bill", "utility", "phone", "internet", "service"],
    Other: []
  };

  const itemLower = itemName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => itemLower.includes(keyword))) {
      return category;
    }
  }
  
  return "Other";
}

// Process Receipt Text
export function processReceiptText(text: string) {
  // Split the text into lines and clean up
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Extract key information
  const date = extractDate(text) || new Date().toISOString().split('T')[0];
  const merchant = extractMerchant(lines);
  const items = extractAmounts(lines).map(item => ({
    name: item.name,
    amount: item.amount,
    category: categorizeExpense(item.name)
  }));
  
  // Calculate total (sum of all items or find the "Total" line)
  let total = 0;
  if (items.length > 0) {
    total = items.reduce((sum, item) => sum + item.amount, 0);
  } else {
    // If no items found, try to extract total from text
    const totalMatch = text.match(/total[\s:]*[$]?(\d+\.\d{2})/i);
    if (totalMatch) {
      total = parseFloat(totalMatch[1]);
    }
  }

  return {
    date,
    merchant,
    items,
    total,
    success: items.length > 0 || total > 0
  };
}
