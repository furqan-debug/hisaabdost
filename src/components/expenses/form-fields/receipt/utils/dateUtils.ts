
/**
 * Format date string or extract date from text
 * @param dateText 
 * @returns 
 */
export function formatDate(dateText: string): string {
  try {
    if (!dateText) {
      return new Date().toISOString().split('T')[0];
    }
    
    // If it's already in ISO format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      return dateText;
    }
    
    const date = new Date(dateText);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Extract date from receipt text using common patterns
 * @param text 
 * @returns 
 */
export function extractDateFromText(text: string): string | null {
  if (!text) return null;
  
  // Common date patterns in receipts
  const datePatterns = [
    // MM/DD/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // DD/MM/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // Month name formats
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(st|nd|rd|th)?\s+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(st|nd|rd|th)?/i
  ];
  
  // Try each pattern
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Use Date object to validate and format the date
        const dateStr = match[0];
        const date = new Date(dateStr);
        
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Continue to next pattern if this one fails
        continue;
      }
    }
  }
  
  // Return today's date as fallback
  return new Date().toISOString().split('T')[0];
}
