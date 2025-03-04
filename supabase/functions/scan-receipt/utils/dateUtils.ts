
// Extract date from receipt text
export function extractDate(lines: string[]): string {
  // Default to today
  let date = new Date().toISOString().split('T')[0];
  
  // Common date patterns
  const datePatterns = [
    /date:?\s*(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/i,
    /date:?\s*([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
    /([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
  ];
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          // Try different date parsing approaches
          const datePart = line.includes("date:") ? line.split("date:")[1].trim() : match[0];
          const parsedDate = new Date(datePart);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Could not parse date:", e);
        }
      }
    }
  }
  
  return date;
}
