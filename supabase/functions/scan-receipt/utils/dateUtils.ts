
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
    // Plain digits that could be dates
    /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/
  ];
  
  // First look for date-related keywords in the receipt
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].toLowerCase();
    
    // Focus on lines with date indicators
    if (line.includes("date") || 
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
  
  // If no date found, return today's date
  return new Date().toISOString().split('T')[0];
}

// Helper function to handle different date formats
function formatDateFromMatch(match: RegExpMatchArray): string {
  let year: number, month: number, day: number;
  
  // MM/DD/YYYY format
  if (match[0].includes('/') && match[3].length === 4) {
    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
    year = parseInt(match[3], 10);
  }
  // MM/DD/YY format
  else if (match[0].includes('/') && match[3].length === 2) {
    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
    year = parseInt(match[3], 10) + 2000; // Assume 20xx for 2-digit years
  }
  // YYYY-MM-DD format
  else if (match[1].length === 4) {
    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
    day = parseInt(match[3], 10);
  }
  // Fallback for other formats
  else {
    // Use the first number as month, second as day
    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
    // For the year, check if it's 2 or 4 digits
    year = parseInt(match[3], 10);
    if (year < 100) {
      year += 2000; // Assume 20xx for 2-digit years
    }
  }
  
  // Validate the date components
  if (month < 1 || month > 12) month = 1;
  if (day < 1 || day > 31) day = 1;
  if (year < 2000 || year > 2100) year = new Date().getFullYear();
  
  // Format as YYYY-MM-DD
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
