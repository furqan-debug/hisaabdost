
/**
 * Cleans up an item name for better display
 */
export function cleanupItemName(itemName: string): string {
  let cleanedName = itemName;
  
  // Remove quantity indicators
  cleanedName = cleanedName.replace(/^\d+\s*[xX]\s*/, '');  // Remove "2 x " prefix
  cleanedName = cleanedName.replace(/^\d+\s+/, '');  // Remove "2 " prefix
  
  // Remove item numbers and SKU codes
  cleanedName = cleanedName.replace(/^#\d+\s*/, ''); // Remove "#123 " prefix
  cleanedName = cleanedName.replace(/\s+\d+$/, '');  // Remove trailing numbers
  cleanedName = cleanedName.replace(/\s{2,}/g, ' ');  // Remove multiple spaces
  
  // Remove special characters at beginning and end
  cleanedName = cleanedName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanedName = cleanedName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Handle common abbreviations
  cleanedName = cleanedName.replace(/(\b)EA(\b)/i, '$1each$2');
  cleanedName = cleanedName.replace(/(\b)PK(\b)/i, '$1pack$2');
  
  // Make first letter uppercase for better appearance
  if (cleanedName.length > 0) {
    cleanedName = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }
  
  return cleanedName;
}
