
// Date utility functions for action processing

// Get today's date in YYYY-MM-DD format
export function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Validate and format date
export function validateAndFormatDate(inputDate: string): string {
  if (!inputDate) return getTodaysDate();
  
  try {
    // Check if it's already in ISO format YYYY-MM-DD
    if (inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(inputDate);
      const year = date.getFullYear();
      
      // If the year is unreasonable (too old or far future), use current date
      if (year < 2020 || year > 2030) {
        console.log(`Year ${year} is out of reasonable range, using today's date`);
        return getTodaysDate();
      }
      
      return inputDate;
    }
    
    // Try to parse the date
    const date = new Date(inputDate);
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

// Parse goal deadline with natural language support
export function parseGoalDeadline(deadline: string): string {
  try {
    if (deadline.toLowerCase().includes('end of month') || 
        deadline.toLowerCase().includes('month end')) {
      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return lastDay.toISOString().split('T')[0];
    } 
    else if (deadline.toLowerCase().includes('end of year') || 
             deadline.toLowerCase().includes('year end')) {
      const today = new Date();
      return `${today.getFullYear()}-12-31`;
    }
    else if (deadline.toLowerCase().includes('next month')) {
      const today = new Date();
      today.setMonth(today.getMonth() + 1);
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    else {
      // Try to parse as date
      const date = new Date(deadline);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  } catch (e) {
    console.error("Error parsing goal deadline:", e);
  }
  
  // Set a default deadline of 3 months from now if parsing failed
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  return threeMonthsLater.toISOString().split('T')[0];
}
