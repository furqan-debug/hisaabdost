
// Utility functions for selecting the most relevant items from receipt scan results

/**
 * Selects the most relevant item from a list of items
 * This is typically the main purchase or the most expensive item
 */
export function selectMainItem(items: any[]): any {
  if (!items || items.length === 0) return {};
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Try to find the item with the highest amount (likely the main purchase)
  return items.reduce((highest, current) => {
    const highestAmount = parseFloat(highest.amount || '0');
    const currentAmount = parseFloat(current.amount || '0');
    return currentAmount > highestAmount ? current : highest;
  }, items[0]);
}

/**
 * Format receipt items for display or storage
 * Converts the items to a standardized format
 */
export function formatReceiptItems(items: any[], receiptUrl?: string): Array<{
  description: string;
  amount: string;
  category: string;
  date: string;
  paymentMethod: string;
  receiptUrl?: string;
}> {
  if (!items || items.length === 0) return [];
  
  return items.map(item => ({
    description: item.description || item.name || "Store Item",
    amount: item.amount || "0.00",
    category: item.category || "Other",
    date: item.date || new Date().toISOString().split('T')[0],
    paymentMethod: item.paymentMethod || "Card",
    receiptUrl: receiptUrl
  }));
}

/**
 * Calculate the total amount from all items
 */
export function calculateTotalAmount(items: any[]): string {
  if (!items || items.length === 0) return "0.00";
  
  const total = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  
  return total.toFixed(2);
}
