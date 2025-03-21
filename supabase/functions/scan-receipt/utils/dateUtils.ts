
// Functions for extracting dates from receipt text

// Extract the date from receipt text and return in YYYY-MM-DD format
export function extractDate(lines: string[]): string {
  const datePatterns = [
    // MM/DD/YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    // MM/DD/YY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/,
    // YYYY-MM-DD
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    // DD-MMM-YYYY (like 15-Jan-2023)
    /(\d{1,2})[\-\s]([A-Za-z]{3})[\-\s](\d{4})/,
    // Plain digits that could be dates
    /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/
  ];
  
  // First look for date-related keywords in the receipt
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].toLowerCase();
    
    // Focus on lines with date indicators
    if (line.includes("date") || 
        line.includes("dt:") ||
        line.includes("purchase") || 
        line.includes("transaction") || 
        line.includes("receipt")) {
      
      // Try the patterns
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          return formatDateFromMatch(match);
        }
      }
    }
  }
  
  // Second pass: look for date patterns anywhere in the top portion of receipt
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    for (const pattern of datePatterns) {
      const match = lines[i].match(pattern);
      if (match) {
        return formatDateFromMatch(match);
      }
    }
  }
  
  // Third pass: try to find a date in any format in the entire receipt
  for (let i = 0; i < lines.length; i++) {
    // Check for date-like pattern (MM/DD/YY or similar)
    const dateLike = lines[i].match(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/);
    if (dateLike) {
      // Try to parse as a date
      try {
        const dateStr = dateLike[0];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          // Ensure it's a reasonable date (not too far in the past or future)
          const year = date.getFullYear();
          if (year >= 2000 && year <= new Date().getFullYear() + 1) {
            return date.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        // Continue searching if this pattern couldn't be parsed
      }
    }
  }
  
  // If no date found, return today's date
  return new Date().toISOString().split('T')[0];
}

// Helper function to handle different date formats
function formatDateFromMatch(match: RegExpMatchArray): string {
  let year: number, month: number, day: number;
  
  // MM/DD/YYYY format
  if (match[0].includes('/') && match[3] && match[3].length === 4) {
    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
    year = parseInt(match[3], 10);
  }
  // MM/DD/YY format
  else if (match[0].includes('/') && match[3] && match[3].length === 2) {
    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
    year = parseInt(match[3], 10) + 2000; // Assume 20xx for 2-digit years
  }
  // YYYY-MM-DD format
  else if (match[1] && match[1].length === 4) {
    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
    day = parseInt(match[3], 10);
  }
  // DD-MMM-YYYY format
  else if (match[2] && isMonthAbbr(match[2])) {
    day = parseInt(match[1], 10);
    month = getMonthNumber(match[2]);
    year = parseInt(match[3], 10);
  }
  // Fallback for other formats
  else {
    // Try to determine the format based on ranges
    // If first number > 12, it's likely DD/MM format
    // If second number > 31, it's likely MM/YY format
    const num1 = parseInt(match[1], 10);
    const num2 = parseInt(match[2], 10);
    const num3 = parseInt(match[3] || "0", 10);
    
    if (num1 > 12 && num1 <= 31) {
      // DD/MM/YYYY or DD/MM/YY
      day = num1;
      month = num2;
      year = num3 < 100 ? num3 + 2000 : num3;
    } else {
      // MM/DD/YYYY or MM/DD/YY (default US format)
      month = num1;
      day = num2;
      year = num3 < 100 ? num3 + 2000 : num3;
    }
  }
  
  // Validate the date components
  if (month < 1 || month > 12) month = 1;
  if (day < 1 || day > 31) day = 1;
  
  // Check for future dates or very old dates (likely errors)
  const currentYear = new Date().getFullYear();
  if (year < 2000 || year > currentYear + 1) {
    year = currentYear;
  }
  
  // Format as YYYY-MM-DD
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Helper function to check if string is a month abbreviation
function isMonthAbbr(str: string): boolean {
  const monthAbbrs = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return monthAbbrs.includes(str.toLowerCase().substring(0, 3));
}

// Helper function to convert month name/abbr to number
function getMonthNumber(monthStr: string): number {
  const months: {[key: string]: number} = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  
  const abbr = monthStr.toLowerCase().substring(0, 3);
  return months[abbr] || 1;
}
