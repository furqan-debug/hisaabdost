
// Helper functions for selecting and validating receipt items

export function selectMainItem(items: any[]): any {
  if (!items || items.length === 0) {
    console.warn("selectMainItem: No items provided");
    return {};
  }
  
  // If there's only one item, use it
  if (items.length === 1) {
    return items[0];
  }
  
  // Filter out invalid items first
  const validItems = items.filter(item => {
    const hasDescription = item.description && item.description.toString().trim().length > 0;
    const hasAmount = item.amount && !isNaN(parseFloat(item.amount.toString().replace(/[$,]/g, '')));
    const validAmount = parseFloat(item.amount.toString().replace(/[$,]/g, '')) > 0;
    
    return hasDescription && hasAmount && validAmount;
  });
  
  if (validItems.length === 0) {
    console.warn("selectMainItem: No valid items found");
    return {};
  }
  
  // If only one valid item, return it
  if (validItems.length === 1) {
    return validItems[0];
  }
  
  // Try to find the item with the highest amount (likely the main purchase)
  return validItems.reduce((highest, current) => {
    const highestAmount = parseFloat(highest.amount?.toString().replace(/[$,]/g, '') || '0');
    const currentAmount = parseFloat(current.amount?.toString().replace(/[$,]/g, '') || '0');
    return currentAmount > highestAmount ? current : highest;
  }, validItems[0]);
}

export function validateReceiptItem(item: any): boolean {
  if (!item) return false;
  
  const hasDescription = item.description && item.description.toString().trim().length > 0;
  const rawAmount = item.amount?.toString().replace(/[$,\s]/g, '') || '0';
  const hasAmount = !isNaN(parseFloat(rawAmount));
  const validAmount = parseFloat(rawAmount) > 0;
  
  return hasDescription && hasAmount && validAmount;
}

export function cleanItemDescription(description: string): string {
  if (!description) return '';
  
  // Remove common receipt prefixes and codes
  let cleaned = description
    .toString()
    .trim()
    .replace(/^item[:.\s-]+/i, '')
    .replace(/^product[:.\s-]+/i, '')
    .replace(/^[a-z]{1,3}\d{4,}[:.\s-]*/i, '') // Remove SKU/UPC codes
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  // Truncate very long descriptions
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50).trim() + '...';
  }
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || 'Receipt Item';
}

export function validateAndCleanAmount(amount: any): number {
  if (!amount) return 0;
  
  const cleanAmount = amount.toString().replace(/[$,\s]/g, '');
  const parsedAmount = parseFloat(cleanAmount);
  
  // Return 0 for invalid amounts
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return 0;
  }
  
  // Cap extremely large amounts (likely OCR errors)
  if (parsedAmount > 10000) {
    console.warn(`Amount ${parsedAmount} seems too large, capping at $10000`);
    return 10000;
  }
  
  // Set minimum amount
  if (parsedAmount < 0.01) {
    return 0.01;
  }
  
  return Math.round(parsedAmount * 100) / 100; // Round to 2 decimal places
}
