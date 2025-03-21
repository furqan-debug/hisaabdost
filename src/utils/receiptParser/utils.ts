
/**
 * Check if text is non-item text (like headers, footers, etc.)
 */
export function isNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('total') || 
         lowerText.includes('subtotal') || 
         lowerText.includes('tax') || 
         lowerText.includes('change') || 
         lowerText.includes('amount') || 
         lowerText.includes('price') || 
         lowerText.includes('qty') || 
         lowerText.includes('quantity') || 
         lowerText.includes('balance') || 
         lowerText.includes('payment') || 
         lowerText === 'item' || 
         lowerText.length < 2;
}
