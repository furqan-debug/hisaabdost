
/**
 * Formats a date string to YYYY-MM-DD format
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    // If it's already in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse date string to Date object
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}, using current date`);
      return new Date().toISOString().split('T')[0];
    }
    
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error);
    return new Date().toISOString().split('T')[0];
  }
}
