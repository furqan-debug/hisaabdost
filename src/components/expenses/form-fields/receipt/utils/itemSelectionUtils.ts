
/**
 * Helper function to select the most relevant item from scan results
 * Usually the highest value item or the first one
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
