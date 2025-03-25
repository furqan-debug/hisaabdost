
// Main function to parse receipt text
export function parseReceiptText(text: string) {
  // Extract store name (usually at top of receipt)
  const merchant = extractMerchant(text);
  
  // Extract items and prices
  const items = extractItems(text);
  
  // Extract date
  const date = extractDate(text);
  
  // Calculate total (sum of all items)
  const total = calculateTotal(items);
  
  return {
    merchant,
    items,
    date,
    total
  };
}

// Extract store name from receipt text
function extractMerchant(text: string) {
  const lines = text.trim().split('\n');
  
  // Store name is typically on one of the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip lines that are likely not the store name
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you/i)) {
      continue;
    }
    
    // If we have a line with all caps, it's likely the store name
    if (line.toUpperCase() === line && line.length > 3) {
      return line;
    }
    
    // If we haven't found a store name by now, just return the first line
    if (i === 4 && line.length > 3) {
      return line;
    }
  }
  
  // Default if no valid store name is found
  return "Store";
}

// Extract date from receipt text
function extractDate(text: string) {
  // Common date formats in receipts
  const datePatterns = [
    /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
    /Date:?\s*(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/i,  // Date: MM/DD/YYYY
    /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})\s*\d{1,2}:\d{1,2}/,  // MM/DD/YYYY HH:MM
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // We found a date - now we need to determine format
      let day, month, year;
      
      // If the year is at index 3 (which is the case for all our patterns)
      year = match[3];
      
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        year = year < "50" ? "20" + year : "19" + year;
      }
      
      // For US format, first number is month, second is day
      // For international format, first number is day, second is month
      // We'll assume US format for simplicity
      month = match[1].padStart(2, '0');
      day = match[2].padStart(2, '0');
      
      // Return in YYYY-MM-DD format
      return `${year}-${month}-${day}`;
    }
  }
  
  // If no date is found, use today's date
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${today.getFullYear()}-${month}-${day}`;
}

// Extract items and prices from receipt text
function extractItems(text: string) {
  const lines = text.trim().split('\n');
  const items = [];
  
  // Different patterns for item-price combinations
  const itemPatterns = [
    /(.+?)\s+(\d+\.\d{2})$/,  // Item 12.34
    /(.+?)\s{2,}(\d+\.\d{2})$/,  // Item    12.34
    /(.+?)\$\s*(\d+\.\d{2})$/,  // Item $12.34
    /(.+?)\s+\$?(\d+\.\d{2})$/,  // Item $12.34 or Item 12.34
  ];
  
  for (const line of lines) {
    // Skip lines that are likely headers, footers, or other non-item text
    if (line.match(/subtotal|tax|total|change|balance|card|cash|payment|thank|you/i)) {
      continue;
    }
    
    // Try each pattern until one matches
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        const amount = match[2];
        
        // Only add if the name isn't too short
        if (name.length > 1) {
          items.push({ name, amount });
          break;
        }
      }
    }
  }
  
  return items;
}

// Calculate the total based on the extracted items
function calculateTotal(items: Array<{name: string, amount: string}>) {
  let total = 0;
  
  for (const item of items) {
    total += parseFloat(item.amount);
  }
  
  return total.toFixed(2);
}
