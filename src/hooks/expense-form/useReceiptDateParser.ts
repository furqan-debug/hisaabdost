
export function useReceiptDateParser() {
  const parseReceiptDate = (dateString: string): string => {
    try {
      // Check if it's already in ISO format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      } 
      
      // Check common date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
      if (dateString.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/)) {
        const dateParts = dateString.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
          // Most receipts use MM/DD/YYYY format in the US
          // For other regions, this could be DD/MM/YYYY
          let month = parseInt(dateParts[0], 10);
          let day = parseInt(dateParts[1], 10);
          let year = parseInt(dateParts[2], 10);
          
          // Validate date parts
          if (isNaN(month) || isNaN(day) || isNaN(year) || 
              month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error("Invalid date components");
          }
          
          // Handle 2-digit years
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          
          // Format as ISO date
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      } 
      
      // Try parsing as a Date object
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        const isoDate = dateObj.toISOString().split('T')[0];
        
        // Sanity check the year
        const year = parseInt(isoDate.split('-')[0], 10);
        if (year >= 2000 && year <= new Date().getFullYear() + 1) {
          return isoDate;
        }
      }
      
      // If all else fails, return today's date
      throw new Error("Unparseable date");
    } catch (err) {
      console.warn("Failed to parse date from receipt:", err);
      return new Date().toISOString().split('T')[0];
    }
  };

  return { parseReceiptDate };
}
