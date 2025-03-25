
/**
 * Format a date string to YYYY-MM-DD format for storage
 * @param dateString A date string in any valid format
 * @returns A string in YYYY-MM-DD format, using today if invalid
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    // If the date is already in ISO format (YYYY-MM-DD), return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Invalid date, return today's date
      return new Date().toISOString().split('T')[0];
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0];
  }
}

// Add an export alias for backward compatibility
export { formatDate as formatDateForStorage };
