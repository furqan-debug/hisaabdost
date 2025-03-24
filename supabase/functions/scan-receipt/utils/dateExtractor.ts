
// Extract date from receipt text
export function extractDate(text: string) {
  // Common date patterns in receipts
  const datePatterns = [
    // MM/DD/YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // MM/DD/YY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,
    // Month names with day and year
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{2})/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        let date = new Date()
        
        if (pattern.toString().includes('Jan|Feb|Mar')) {
          // Handle month name patterns
          const monthMap = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          }
          
          const month = monthMap[match[1].toLowerCase().substring(0, 3)]
          const day = parseInt(match[2])
          let year = parseInt(match[3])
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900
          }
          
          date = new Date(year, month, day)
        } else {
          // Handle numeric date patterns (MM/DD/YYYY or MM/DD/YY)
          const month = parseInt(match[1]) - 1 // JS months are 0-based
          const day = parseInt(match[2])
          let year = parseInt(match[3])
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900
          }
          
          date = new Date(year, month, day)
        }
        
        // Format date to match required output format
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      } catch (e) {
        // Continue if this date parsing fails
        console.error("Date parsing error:", e)
      }
    }
  }
  
  // Look for date keywords
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.toLowerCase().includes('date:') || line.toLowerCase().includes('date ')) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          // Handle the date as above
          try {
            const date = new Date()
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          } catch (e) {
            // Continue if this date parsing fails
          }
        }
      }
    }
  }
  
  // Return today's date if no date was found
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
