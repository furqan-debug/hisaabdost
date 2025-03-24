/**
 * Utilities for selecting and processing items from receipt scan results
 */

// Find the most relevant item from a list of extracted items
export function findMainItem(items: any[]): any {
  if (!items || items.length === 0) return null;
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Otherwise, use the most expensive item
  return [...items].sort((a, b) => {
    const amountA = parseFloat(a.amount || '0');
    const amountB = parseFloat(b.amount || '0');
    return amountB - amountA;
  })[0];
}

// Format the description from item name and store
export function formatDescription(itemName: string, storeName: string): string {
  if (itemName && itemName.length > 3) {
    return itemName.charAt(0).toUpperCase() + itemName.slice(1);
  }
  
  if (storeName) {
    return `Purchase from ${storeName}`;
  }
  
  return "Store Purchase";
}
