
/**
 * Utilities for formatting and handling dates from receipt scans
 */

// Format date for database
export function formatDate(dateString: string): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    // If already in ISO format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}
