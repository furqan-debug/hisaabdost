
export function useReceiptDateParser() {
  const parseReceiptDate = (dateString: string): string => {
    try {
      // If no date is provided, return today's date
      if (!dateString || dateString.trim() === '') {
        return new Date().toISOString().split('T')[0];
      }
      
      // If it's already in ISO format YYYY-MM-DD, return it directly
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      // Try to handle common date formats like MM/DD/YYYY or DD/MM/YYYY
      if (dateString.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/)) {
        const parts = dateString.split(/[\/\-\.]/);
        
        // Assume MM/DD/YYYY format (common in US receipts)
        let month = parseInt(parts[0], 10);
        let day = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        
        // Basic validation
        if (month < 1 || month > 12) return new Date().toISOString().split('T')[0];
        if (day < 1 || day > 31) return new Date().toISOString().split('T')[0];
        
        // Handle 2-digit years
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year;
        }
        
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      
      // Last resort: try the JavaScript Date object
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      // If all parsing fails, return today's date
      return new Date().toISOString().split('T')[0];
    } catch (error) {
      console.warn('Failed to parse receipt date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  return { parseReceiptDate };
}
