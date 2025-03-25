
// Main function to parse receipt text
export function parseReceiptText(text: string) {
  // Return empty result if text is empty or invalid
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.warn("Empty or invalid receipt text provided");
    return {
      merchant: "Unknown",
      items: [],
      date: new Date().toISOString().split('T')[0],
      total: "0.00"
    };
  }
  
  console.log("Parsing receipt text:", text.substring(0, 100) + "...");
  
  try {
    // Extract store name (usually at top of receipt)
    const merchant = extractMerchant(text);
    
    // Extract items and prices
    const items = extractItems(text);
    
    // Extract date
    const date = extractDate(text);
    
    // Calculate total (sum of all items)
    const total = calculateTotal(items);
    
    // Log the results for debugging
    console.log("Parsed receipt data:", { merchant, itemCount: items.length, date, total });
    
    return {
      merchant,
      items,
      date,
      total
    };
  } catch (error) {
    console.error("Error parsing receipt:", error);
    
    // Return a fallback result on error
    return {
      merchant: "Unknown Merchant",
      items: [],
      date: new Date().toISOString().split('T')[0],
      total: "0.00"
    };
  }
}

// Extract store name from receipt text
function extractMerchant(text: string) {
  const lines = text.trim().split('\n');
  
  // Store name is typically on one of the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip very short lines and lines with numbers only
    if (line.length < 3 || /^\d+$/.test(line)) {
      continue;
    }
    
    // Skip lines that are likely not the store name
    if (line.match(/receipt|invoice|tel|phone|fax|date|time|\d{2}\/\d{2}\/\d{4}|thank|you/i)) {
      continue;
    }
    
    // If we have a line with all caps, it's likely the store name
    if (line.toUpperCase() === line && line.length > 3) {
      return line;
    }
    
    // Another pattern - first line that's not a date, number, etc.
    if (!line.match(/^\d/) && !line.match(/^[A-Z]{1,3}$/) && line.length > 3) {
      return line;
    }
  }
  
  // Default if no valid store name is found
  return "Unknown Merchant";
}

// Extract date from receipt text
function extractDate(text: string) {
  // Common date formats in receipts
  const datePatterns = [
    /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
    /Date:?\s*(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/i,  // Date: MM/DD/YYYY
    /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})\s*\d{1,2}:\d{1,2}/,  // MM/DD/YYYY HH:MM
    /(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/,  // YYYY/MM/DD
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // We found a date - now we need to determine format
      let day, month, year;
      
      // Check if the pattern is for YYYY/MM/DD format
      if (pattern.toString().includes('(\\d{4})')) {
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      } else {
        // For other formats
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
      }
      
      // Validate date components
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      
      if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        continue; // Invalid date, try next pattern
      }
      
      // Return in YYYY-MM-DD format
      return `${year}-${month}-${day}`;
    }
  }
  
  // Also look for date words like "Jan 23, 2023" or "January 23 2023"
  const monthWords = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i;
  const monthWordMatch = text.match(monthWords);
  
  if (monthWordMatch) {
    const monthText = monthWordMatch[0].split(' ')[0].toLowerCase();
    const day = monthWordMatch[1].padStart(2, '0');
    const year = monthWordMatch[2];
    
    // Map month text to month number
    const monthMap: {[key: string]: string} = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    // Get first 3 chars of month text to match against our map
    const monthKey = monthText.substring(0, 3);
    const month = monthMap[monthKey];
    
    if (month) {
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
  
  // Find where the items section likely starts and ends
  const startIndex = Math.min(5, Math.floor(lines.length * 0.15)); // Skip first few lines (headers)
  const endIndex = Math.max(lines.length - 5, Math.ceil(lines.length * 0.8)); // Skip last few lines (totals)
  
  console.log(`Processing potential item lines from ${startIndex} to ${endIndex}`);
  
  // Different patterns for item-price combinations
  const itemPatterns = [
    /(.+?)\s+(\d+\.\d{2})$/,  // Item 12.34
    /(.+?)\s{2,}(\d+\.\d{2})$/,  // Item    12.34
    /(.+?)\$\s*(\d+\.\d{2})$/,  // Item $12.34
    /(.+?)\s+\$?(\d+\.\d{2})$/,  // Item $12.34 or Item 12.34
    /(.+?)\s+(\d+)[.,](\d{2})$/,  // Item 12,34 (comma decimal separator)
  ];
  
  // Non-item indicators to skip lines
  const nonItemPatterns = [
    /subtotal|tax|total|change|balance|card|cash|payment|thank|you/i,
    /\d{2}\/\d{2}\/\d{2,4}|\d{2}\-\d{2}\-\d{2,4}/,  // Date patterns
    /^\s*\d+\s*$/,  // Just a number
    /^\s*\*+\s*$/,  // Just asterisks
    /^\s*\-+\s*$/   // Just dashes
  ];
  
  // Process each line
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines and non-item lines
    if (line.length < 3 || nonItemPatterns.some(pattern => line.match(pattern))) {
      continue;
    }
    
    // Try each pattern until one matches
    let matched = false;
    for (const pattern of itemPatterns) {
      let match;
      
      // Handle comma decimal separator
      if (pattern.toString().includes('[.,]')) {
        match = line.match(pattern);
        if (match) {
          const name = match[1].trim();
          // Combine the number parts with a period
          const amount = `${match[2]}.${match[3]}`;
          
          // Only add if the name isn't too short and price seems reasonable
          const price = parseFloat(amount);
          if (name.length > 1 && price > 0 && price < 10000) {
            items.push({ name, amount });
            matched = true;
            break;
          }
        }
      } else {
        // Standard decimal pattern
        match = line.match(pattern);
        if (match) {
          const name = match[1].trim();
          const amount = match[2];
          
          // Only add if the name isn't too short and price seems reasonable
          const price = parseFloat(amount);
          if (name.length > 1 && price > 0 && price < 10000) {
            items.push({ name, amount });
            matched = true;
            break;
          }
        }
      }
    }
    
    // If no pattern matched, check for a split-line item (item on one line, price on next)
    if (!matched && i + 1 < endIndex) {
      const nextLine = lines[i + 1].trim();
      const priceOnly = nextLine.match(/^\s*\$?\s*(\d+\.\d{2})\s*$/);
      
      if (priceOnly && line.length > 2 && 
          !nonItemPatterns.some(pattern => line.match(pattern))) {
        items.push({
          name: line,
          amount: priceOnly[1]
        });
        i++; // Skip the price line since we've processed it
      }
    }
  }
  
  // Deduplicate items by name and return
  const uniqueItems = new Map();
  items.forEach(item => {
    const key = item.name.toLowerCase();
    if (!uniqueItems.has(key) || parseFloat(uniqueItems.get(key).amount) < parseFloat(item.amount)) {
      uniqueItems.set(key, item);
    }
  });
  
  // Convert map back to array and sort by price (highest first)
  return Array.from(uniqueItems.values())
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
}

// Calculate the total based on the extracted items
function calculateTotal(items: Array<{name: string, amount: string}>) {
  if (items.length === 0) return "0.00";
  
  let total = 0;
  
  for (const item of items) {
    total += parseFloat(item.amount);
  }
  
  return total.toFixed(2);
}

// Utility function to clean text
export function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}
