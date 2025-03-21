
/**
 * Extracts the date from receipt text
 */
export function extractDate(text: string, lines: string[]): string {
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
