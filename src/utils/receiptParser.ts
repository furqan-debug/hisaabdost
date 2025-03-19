
/**
 * Utility function to parse receipt text and extract key information
 */

/**
 * Extracts merchant name, total amount, and date from receipt text
 * @param text - The OCR text extracted from a receipt
 * @returns Object containing merchant, amount, and date
 */
export function parseReceiptText(text: string): { 
  merchant: string; 
  amount: string; 
  date: string;
} {
  // Split into lines for easier processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract merchant name (usually at the top of the receipt)
  const merchant = extractMerchant(lines);
  
  // Extract total amount
  const amount = extractAmount(text, lines);
  
  // Extract date
  const date = extractDate(text, lines);
  
  return {
    merchant,
    amount,
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
 * Extracts the total amount from receipt text
 */
function extractAmount(text: string, lines: string[]): string {
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
    const match = text.match(pattern);
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
    if (line.toLowerCase().includes("date") || 
        line.toLowerCase().includes("time") || 
        line.toLowerCase().includes("receipt")) {
      
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
    
    // Basic validation
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }
  
  // YYYY-MM-DD format
  if (match[0].match(/\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}/)) {
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10);
    let day = parseInt(match[3], 10);
    
    // Validate
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
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
