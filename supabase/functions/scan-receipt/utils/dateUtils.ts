
// Custom date extraction utility for receipt OCR

// Extract a date from receipt text
export function extractDate(lines: string[]): string {
  // Common date patterns for receipts
  const datePatterns = [
    // MM/DD/YY format
    /(\d{1,2})[\/](\d{1,2})[\/](\d{2})\b/,
    
    // MM/DD/YYYY format
    /(\d{1,2})[\/](\d{1,2})[\/](20\d{2})\b/,
    
    // MM-DD-YY format
    /(\d{1,2})[\-](\d{1,2})[\-](\d{2})\b/,
    
    // Special case for restaurant receipts with dates like "3/15/12"
    /(\d{1,2})[\/](\d{1,2})[\/](\d{2})/
  ];
  
  // First pass: look for date patterns with accompanying text
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check for lines that might contain a date
    if (line.includes("date") || line.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/)) {
      for (const pattern of datePatterns) {
        const match = lines[i].match(pattern);
        if (match) {
          return formatDate(match[1], match[2], match[3]);
        }
      }
    }
  }
  
  // Second pass: Look for lines that match time patterns (common in restaurant receipts)
  // like "3/15/12 6:06:44 PM"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\s+\d{1,2}:\d{2}(:\d{2})?\s*[APap][Mm]?/)) {
      const dateMatch = line.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
      if (dateMatch) {
        return formatDate(dateMatch[1], dateMatch[2], dateMatch[3]);
      }
    }
  }
  
  // Third pass: Check all lines for date patterns
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of datePatterns) {
      const match = lines[i].match(pattern);
      if (match) {
        return formatDate(match[1], match[2], match[3]);
      }
    }
  }
  
  // If no date found, return today's date
  return new Date().toISOString().split('T')[0];
}

// Format date parts into YYYY-MM-DD format
function formatDate(month: string, day: string, year: string): string {
  let m = parseInt(month, 10);
  let d = parseInt(day, 10);
  let y = parseInt(year, 10);
  
  // Basic validation
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return new Date().toISOString().split('T')[0];
  }
  
  // Handle 2-digit years
  if (y < 100) {
    // If year is before 80, assume it's 20xx, otherwise 19xx
    y = y < 80 ? 2000 + y : 1900 + y;
  }
  
  return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
}
