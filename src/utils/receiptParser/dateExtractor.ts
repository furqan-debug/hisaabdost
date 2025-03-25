
/**
 * Extracts the date from receipt text
 */
export function extractDate(text: string, lines: string[]): string {
  // Common date patterns
  const datePatterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    
    // DD.MM.YYYY (European format with dots)
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/i,
    
    // YYYY-MM-DD
    /(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/i,
    
    // Month DD, YYYY
    /([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
    
    // DD Month YYYY
    /(\d{1,2})[,\s]+([a-z]+)[,\s]+(\d{4})/i,
    
    // Date: prefix patterns
    /date:?\s*(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    /datum:?\s*(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i, // German "Datum"
    /date:?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i, // European date with "Date:" prefix
  ];
  
  // First look for lines with date-related keywords
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("date") || 
        lowerLine.includes("datum") || // German
        lowerLine.includes("fecha") || // Spanish
        lowerLine.includes("data") ||  // Italian/Portuguese
        lowerLine.includes("purchase") || 
        lowerLine.includes("transaction")) {
      
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            const parsedDate = parseMatchToISODate(match, pattern);
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
          const parsedDate = parseMatchToISODate(match, pattern);
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
function parseMatchToISODate(match: RegExpMatchArray, pattern: RegExp): string | null {
  const patternStr = pattern.toString();
  
  // MM/DD/YYYY or DD/MM/YYYY format
  if (patternStr.includes('(\\d{1,2})[\/\\.\\-](\\d{1,2})[\/\\.\\-](\\d{2,4})')) {
    let day, month, year;
    
    // For European format (DD.MM.YYYY), treat first number as day
    if (patternStr.includes('(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})') || 
        match[0].includes('.')) {
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
    } else {
      // For US format, assume first number is month (but we'll validate)
      const possibleMonth = parseInt(match[1], 10);
      const possibleDay = parseInt(match[2], 10);
      
      // If first number is > 12, it must be a day, not a month
      if (possibleMonth > 12) {
        day = possibleMonth;
        month = possibleDay;
      } else {
        // Default to US format otherwise
        month = possibleMonth;
        day = possibleDay;
      }
      
      year = parseInt(match[3], 10);
    }
    
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
  if (patternStr.includes('(\\d{4})[\/\\.\\-](\\d{1,2})[\/\\.\\-](\\d{1,2})')) {
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10);
    let day = parseInt(match[3], 10);
    
    // Validate
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return null;
    }
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  // Month name formats
  if (patternStr.includes('([a-z]+)\\s+(\\d{1,2})[,\\s]+(\\d{4})') || 
      patternStr.includes('(\\d{1,2})[,\\s]+([a-z]+)[,\\s]+(\\d{4})')) {
    
    // Map of month names to numbers
    const monthMap: {[key: string]: number} = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
      // German months
      'jan': 1, 'feb': 2, 'mär': 3, 'mar': 3, 'apr': 4, 'mai': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'dez': 12,
      // French months
      'janv': 1, 'févr': 2, 'mars': 3, 'avri': 4, 'mai': 5, 'juin': 6,
      'juil': 7, 'août': 8, 'sept': 9, 'oct': 10, 'nov': 11, 'déc': 12
    };
    
    let day, month, year;
    
    if (patternStr.includes('([a-z]+)\\s+(\\d{1,2})')) {
      // Month name first (e.g., "January 15, 2023")
      const monthName = match[1].toLowerCase().substring(0, 3);
      month = monthMap[monthName];
      day = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
    } else {
      // Day first (e.g., "15 January 2023")
      day = parseInt(match[1], 10);
      const monthName = match[2].toLowerCase().substring(0, 3);
      month = monthMap[monthName];
      year = parseInt(match[3], 10);
    }
    
    // Validate
    if (!month || month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
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
