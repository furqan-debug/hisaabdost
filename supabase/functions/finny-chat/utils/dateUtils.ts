
// Get today's date in YYYY-MM-DD format
export function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Validate and format date strings
export function validateAndFormatDate(dateStr?: string): string {
  if (!dateStr) return getTodaysDate();
  
  try {
    // Check if it's already in ISO format YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      
      // If the year is unreasonable (too old or far future), use current date
      if (year < 2020 || year > 2030) {
        console.log(`Year ${year} is out of reasonable range, using today's date`);
        return getTodaysDate();
      }
      
      return dateStr;
    }
    
    // Try to parse the date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      
      // If the year is unreasonable, use current date
      if (year < 2020 || year > 2030) {
        console.log(`Year ${year} is out of reasonable range, using today's date`);
        return getTodaysDate();
      }
      
      // Format as YYYY-MM-DD
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch (error) {
    console.error("Date validation error:", error);
  }
  
  // Default to today if parsing fails
  return getTodaysDate();
}

// Parse goal deadline from various formats
export function parseGoalDeadline(deadline: string): string {
  if (!deadline) {
    // Set a default deadline of 6 months from now if not provided
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    return sixMonthsLater.toISOString().split('T')[0];
  }
  
  // Handle relative dates like "in 6 months", "next year", etc.
  const lowerDeadline = deadline.toLowerCase();
  const currentDate = new Date();
  
  if (lowerDeadline.includes('month')) {
    const monthsMatch = lowerDeadline.match(/(\d+)\s*months?/);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1]);
      currentDate.setMonth(currentDate.getMonth() + months);
      return currentDate.toISOString().split('T')[0];
    }
  }
  
  if (lowerDeadline.includes('year')) {
    const yearsMatch = lowerDeadline.match(/(\d+)\s*years?/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      currentDate.setFullYear(currentDate.getFullYear() + years);
      return currentDate.toISOString().split('T')[0];
    }
  }
  
  // Try to parse as a regular date
  return validateAndFormatDate(deadline);
}
