
// Clean up an item name
export function cleanupItemName(itemName: string): string {
  let cleanName = itemName;
  
  // Remove quantity indicators
  cleanName = cleanName.replace(/^\d+\s*[xX]\s*/, '');
  cleanName = cleanName.replace(/^\d+\s+/, '');
  
  // Remove SKU codes/numbers
  cleanName = cleanName.replace(/\s*#\d+/, '');
  cleanName = cleanName.replace(/\d{5,}/, '');
  
  // Remove department/category prefixes
  cleanName = cleanName.replace(/^(grocery|produce|dairy|bakery|meat|deli):\s*/i, '');
  
  // Remove special characters at beginning and end
  cleanName = cleanName.replace(/^[^a-zA-Z0-9]+/, '');
  cleanName = cleanName.replace(/[^a-zA-Z0-9]+$/, '');
  
  // Remove multiple spaces
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  if (cleanName.length > 0) {
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
  
  return cleanName;
}
