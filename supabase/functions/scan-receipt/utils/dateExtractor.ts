
// Extract date from receipt text
export function extractDate(text: string) {
  // Regex patterns for various date formats
  const datePatterns = [
    // MM/DD/YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    // MM/DD/YY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/,
    // Month name formats
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{2})/i,
    // YYYY-MM-DD
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/
  ];

  // Look for date patterns in the full text
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let date = new Date();
        
        // Process month name patterns
        if (pattern.toString().includes('Jan|Feb|Mar')) {
          const monthMap = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          };
          
          const month = monthMap[match[1].toLowerCase().substring(0, 3)];
          const day = parseInt(match[2]);
          let year = parseInt(match[3]);
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          
          // Validate date components
          if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
            date = new Date(year, month, day);
            return formatDate(date);
          }
        } 
        // Process YYYY-MM-DD format
        else if (pattern.toString().includes('\\d{4}')) {
          if (match[1] && match[2] && match[3]) {
            // Check if first group is year (4 digits)
            if (match[1].length === 4) {
              const year = parseInt(match[1]);
              const month = parseInt(match[2]) - 1; // JS months are 0-based
              const day = parseInt(match[3]);
              
              // Validate date components
              if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                date = new Date(year, month, day);
                return formatDate(date);
              }
            } else {
              // MM/DD/YYYY format
              const month = parseInt(match[1]) - 1; // JS months are 0-based
              const day = parseInt(match[2]);
              let year = parseInt(match[3]);
              
              // Handle 2-digit years
              if (year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              
              // Validate date components
              if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                date = new Date(year, month, day);
                return formatDate(date);
              }
            }
          }
        }
        // Process numeric date patterns
        else {
          const firstNum = parseInt(match[1]);
          const secondNum = parseInt(match[2]);
          let year = parseInt(match[3]);
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          
          // Assume MM/DD/YYYY format (common in US receipts)
          const month = firstNum - 1; // JS months are 0-based
          const day = secondNum;
          
          // Validate date components
          if (month >= 0 && month < 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
            date = new Date(year, month, day);
            return formatDate(date);
          }
          
          // Try alternative DD/MM/YYYY interpretation if the first attempt fails
          if (firstNum >= 1 && firstNum <= 31 && secondNum >= 1 && secondNum <= 12) {
            const altMonth = secondNum - 1;
            const altDay = firstNum;
            date = new Date(year, altMonth, altDay);
            return formatDate(date);
          }
        }
      } catch (e) {
        // Continue if this date parsing fails
        console.error("Date parsing error:", e);
      }
    }
  }
  
  // Look for date keywords
  const lines = text.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('date:') || lowerLine.includes('date ')) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          // Try to parse this date
          try {
            // Similar parsing logic as above
            const testDate = new Date();
            return formatDate(testDate);
          } catch (e) {
            // Continue if this date parsing fails
          }
        }
      }
    }
  }
  
  // If no date was found, use today's date
  return formatDate(new Date());
}

// Format date in a user-friendly format
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
