
/**
 * Utility function to parse receipt text and extract key information
 */

/**
 * Extracts merchant name, items with prices, and date from receipt text
 * @param text - The OCR text extracted from a receipt
 * @returns Object containing merchant, items array, and date
 */
export function parseReceiptText(text: string): { 
  merchant: string; 
  items: Array<{name: string; amount: string}>;
  date: string;
} {
  // Split into lines for easier processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract merchant name (usually at the top of the receipt)
  const merchant = extractMerchant(lines);
  
  // Extract line items with their prices
  const items = extractLineItems(lines, text);
  
  // Extract date
  const date = extractDate(text, lines);
  
  return {
    merchant,
    items,
    date
  };
}

/**
 * Extracts the merchant/store name from receipt text
 */
function extractMerchant(lines: string[]): string {
  // Usually the first few lines of a receipt contain the store name
  if (lines.length > 0) {
    // Check for common store name patterns
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      // Skip lines that are likely not store names
      if (lines[i].match(/receipt|invoice|tel:|www\.|http|thank|order|date|time|\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}|\d+\.\d{2}|\$\d+\.\d{2}/i)) {
        continue;
      }
      
      // Take the first line that looks like a name (not too short, not too long)
      if (lines[i].length > 2 && lines[i].length < 40) {
        return lines[i];
      }
    }
    // If no better match, default to first line
    return lines[0];
  }
  return "Unknown Merchant";
}

/**
 * Extracts individual line items with their prices
 */
function extractLineItems(lines: string[], fullText: string): Array<{name: string; amount: string}> {
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
 * Check if text is non-item text (like headers, footers, etc.)
 */
function isNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('total') || 
         lowerText.includes('subtotal') || 
         lowerText.includes('tax') || 
         lowerText.includes('change') || 
         lowerText.includes('amount') || 
         lowerText.includes('price') || 
         lowerText.includes('qty') || 
         lowerText.includes('quantity') || 
         lowerText.includes('balance') || 
         lowerText.includes('payment') || 
         lowerText === 'item' || 
         lowerText.length < 2;
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

/**
 * Extracts the total amount from receipt text (used as fallback)
 */
function extractAmount(lines: string[], fullText: string): string {
  // Look for total patterns with common keywords
  const totalPatterns = [
    /total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /amount\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /balance\s*due\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /grand\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /final\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /sum\s*total\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /total\s*amount\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
    /to\s*pay\s*[:\.\s]*\$?\s*(\d+\.\d{2})/i,
  ];
  
  // First look at the bottom portion of the receipt where totals are typically found
  const bottomThird = Math.floor(lines.length * 0.6);
  for (let i = bottomThird; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Focus on lines containing total-related keywords
    if (line.includes("total") || line.includes("amount due") || 
        line.includes("balance") || line.includes("to pay") || 
        line.includes("sum") || line.includes("due")) {
      
      // Try all total patterns
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // Fallback: look for any dollar amount in this line
      const amountMatch = line.match(/\$?\s*(\d+\.\d{2})/);
      if (amountMatch && amountMatch[1]) {
        return amountMatch[1];
      }
    }
  }
  
  // Second pass: look for standalone amounts near the bottom (could be totals without labels)
  for (let i = Math.floor(lines.length * 0.8); i < lines.length; i++) {
    const amountMatch = lines[i].match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
    if (amountMatch && amountMatch[1] && parseFloat(amountMatch[1]) > 0) {
      return amountMatch[1];
    }
  }
  
  // Last resort: check the whole text for any pattern with "total"
  for (const pattern of totalPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return "0.00";
}

/**
 * Extracts the date from receipt text
 */
function extractDate(text: string, lines: string[]): string {
  // Common date patterns
  const datePatterns = [
    // MM/DD/YYYY or MM/DD/YY
    /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    
    // YYYY-MM-DD
    /(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/i,
    
    // Month DD, YYYY
    /([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
    
    // DD Month YYYY
    /(\d{1,2})[,\s]+([a-z]+)[,\s]+(\d{4})/i,
  ];
  
  // First look for lines with date-related keywords
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("date") || 
        lowerLine.includes("purchase") || 
        lowerLine.includes("transaction")) {
      
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            const parsedDate = parseMatchToISODate(match);
            if (parsedDate) return parsedDate;
          } catch (e) {
            // Continue to next pattern if this one fails
          }
        }
      }
    }
  }
  
  // Second pass: look for date patterns anywhere in the receipt
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          const parsedDate = parseMatchToISODate(match);
          if (parsedDate) return parsedDate;
        } catch (e) {
          // Continue to next pattern if this one fails
        }
      }
    }
  }
  
  // If no date found, return today's date
  return new Date().toISOString().split('T')[0];
}

/**
 * Helper to convert a date match to ISO format YYYY-MM-DD
 */
function parseMatchToISODate(match: RegExpMatchArray): string | null {
  // MM/DD/YYYY format
  if (match[0].match(/\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/)) {
    let month = parseInt(match[1], 10);
    let day = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    
    // Basic validation - reject clearly invalid dates
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return null;
    }
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  // YYYY-MM-DD format
  if (match[0].match(/\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}/)) {
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10);
    let day = parseInt(match[3], 10);
    
    // Validate
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return null;
    }
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  // Try standard Date parsing as fallback
  try {
    const dateObj = new Date(match[0]);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
  } catch (e) {
    // Parsing failed
  }
  
  return null;
}
