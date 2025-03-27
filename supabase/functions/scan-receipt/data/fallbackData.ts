
/**
 * Generate fallback data when OCR processing fails
 * @returns Array of generic expense items
 */
export function generateFallbackData() {
  // Return a generic expense item
  return [
    { 
      description: "Store Purchase",
      amount: "15.99",
      category: "Shopping",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "Card"
    }
  ];
}
