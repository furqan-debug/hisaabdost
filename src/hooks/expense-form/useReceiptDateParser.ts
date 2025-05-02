
import { format } from "date-fns";

export function useReceiptDateParser() {
  const parseReceiptDate = (dateString: string): string => {
    try {
      // If no date is provided, return today's date
      if (!dateString || dateString.trim() === '') {
        const today = new Date().toISOString().split('T')[0];
        console.log("No receipt date provided, using today's date:", today);
        return today;
      }
      
      // If it's already in ISO format YYYY-MM-DD, validate the year is reasonable
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        
        // If the year is unreasonable (too old or far future), use current date
        if (year < 2020 || year > 2030) {
          console.log(`Year ${year} is out of reasonable range, using today's date`);
          return new Date().toISOString().split('T')[0];
        }
        
        console.log("Date already in ISO format and valid:", dateString);
        return dateString;
      }
      
      // Try to handle common date formats like MM/DD/YYYY, DD/MM/YYYY, MM-DD-YYYY
      if (dateString.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/)) {
        const parts = dateString.split(/[\/\-\.]/);
        
        // Assume MM/DD/YYYY format (common in US receipts)
        let month = parseInt(parts[0], 10);
        let day = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        
        // Handle 2-digit years - assume more recent years (2020s) instead of 1900s
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year;
        }
        
        // Validate year is reasonable
        if (year < 2020 || year > 2030) {
          console.log(`Year ${year} is out of reasonable range, using today's date`);
          return new Date().toISOString().split('T')[0];
        }
        
        // Basic validation
        if (month < 1 || month > 12) {
          console.log("Invalid month in date, using today's date");
          return new Date().toISOString().split('T')[0];
        }
        if (day < 1 || day > 31) {
          console.log("Invalid day in date, using today's date");
          return new Date().toISOString().split('T')[0];
        }
        
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        console.log("Parsed date from parts:", formattedDate);
        return formattedDate;
      }
      
      // Last resort: try the JavaScript Date object
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        
        // Validate year is reasonable
        if (year < 2020 || year > 2030) {
          console.log(`Year ${year} is out of reasonable range, using today's date`);
          return new Date().toISOString().split('T')[0];
        }
        
        const formattedDate = date.toISOString().split('T')[0];
        console.log("Parsed date using Date object:", formattedDate);
        return formattedDate;
      }
      
      // If all parsing fails, return today's date
      console.log("Could not parse date, using today's date");
      const today = new Date().toISOString().split('T')[0];
      console.log("Today's date:", today);
      return today;
    } catch (error) {
      console.warn('Failed to parse receipt date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Helper to check if a date is today
  const isToday = (dateString: string): boolean => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  // Format a date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    try {
      if (isToday(dateString)) return 'Today';
      return format(new Date(dateString), 'PP');
    } catch (e) {
      return dateString;
    }
  };

  return { 
    parseReceiptDate,
    isToday,
    formatDateForDisplay
  };
}
