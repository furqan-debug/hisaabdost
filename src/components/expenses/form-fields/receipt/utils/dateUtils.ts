
/**
 * Format a date string to be stored in the database
 */
export function formatDate(dateString?: string): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    // If it's already in ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return dateString.split('T')[0];
    }
    
    // Try to parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Return as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Format date for storage in the database
 * Alias for formatDate to maintain compatibility with both naming conventions
 */
export const formatDateForStorage = formatDate;
