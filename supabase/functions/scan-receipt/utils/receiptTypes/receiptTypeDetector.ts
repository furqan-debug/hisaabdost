
// Functions to determine receipt type for specialized handling

/**
 * Determine type of receipt for specialized handling
 */
export function determineReceiptType(lines: string[], storeName: string): string {
  const fullText = lines.join(' ').toLowerCase();
  
  // Check for gas station keywords
  if (storeName.toLowerCase().includes('shell') || 
      storeName.toLowerCase().includes('gas') ||
      storeName.toLowerCase().includes('petrol') ||
      storeName.toLowerCase().includes('exxon') ||
      storeName.toLowerCase().includes('mobil') ||
      storeName.toLowerCase().includes('bp') ||
      storeName.toLowerCase().includes('chevron') ||
      fullText.includes('fuel') || 
      fullText.includes('gas') ||
      fullText.includes('litres') ||
      fullText.includes('gallons') ||
      fullText.includes('pump')) {
    return "gas";
  }
  
  // Check for restaurant keywords
  if (storeName.toLowerCase().includes('restaurant') ||
      storeName.toLowerCase().includes('cafe') ||
      storeName.toLowerCase().includes('bar') ||
      storeName.toLowerCase().includes('grill') ||
      fullText.includes('server') ||
      fullText.includes('table') ||
      fullText.includes('tip') ||
      fullText.includes('gratuity')) {
    return "restaurant";
  }
  
  // Default to general retail
  return "retail";
}
