
// Extract date from receipt text
export function extractDate(lines: string[]): string {
  // Default to today
  const today = new Date().toISOString().split('T')[0];
  
  // Common date patterns
  const datePatterns = [
    // Pattern for date formats like: date: MM/DD/YYYY or MM/DD/YY or MM-DD-YYYY etc.
    /date:?\s*(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    // General date format without "date:" prefix
    /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    // Pattern for date formats like: date: Month DD, YYYY
    /date:?\s*([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
    // General date format with month name
    /([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
    // Date string with yyyy-mm-dd format
    /(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/i,
  ];
  
  // First attempt - look for specific date formats
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          // If we find a clear date pattern
          if (match.length >= 4) {
            // For MM/DD/YYYY format (most common in US receipts)
            if (match[0].match(/\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/)) {
              // Extract components
              let month = parseInt(match[1], 10);
              let day = parseInt(match[2], 10);
              let year = parseInt(match[3], 10);
              
              // Handle 2-digit years
              if (year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              
              // Validate components - make sure they're reasonable values
              if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              }
            }
            
            // For YYYY-MM-DD format
            if (match[0].match(/\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}/)) {
              let year = parseInt(match[1], 10);
              let month = parseInt(match[2], 10);
              let day = parseInt(match[3], 10);
              
              // Validate date components with reasonable ranges
              if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              }
            }
          }
          
          // Try parsing the whole string as a date
          const datePart = line.includes("date:") ? line.split("date:")[1].trim() : match[0];
          const parsedDate = new Date(datePart);
          if (!isNaN(parsedDate.getTime())) {
            // Verify this isn't an unreasonable date (not too far in the past or future)
            const year = parsedDate.getFullYear();
            if (year >= 1900 && year <= 2100) {
              return parsedDate.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          console.warn("Could not parse date:", e);
        }
      }
    }
  }
  
  // Second attempt - look for time-related lines that usually accompany dates
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/time|hour|clock|timestamp/i)) {
      // Check the line above and below for potential dates
      for (let j = Math.max(0, i-2); j <= Math.min(i+2, lines.length-1); j++) {
        if (i !== j) {
          for (const pattern of datePatterns) {
            const match = lines[j].match(pattern);
            if (match) {
              try {
                // If we find a date, parse it as before
                if (match.length >= 4) {
                  let month = parseInt(match[1], 10);
                  let day = parseInt(match[2], 10);
                  let year = parseInt(match[3], 10);
                  
                  if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                  }
                  
                  // Additional validation
                  if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  }
                }
              } catch (e) {
                console.warn("Second attempt to parse date failed:", e);
              }
            }
          }
        }
      }
    }
  }
  
  // If we couldn't extract a date, return today's date
  console.log("Could not extract date from receipt, using today's date");
  return today;
}
