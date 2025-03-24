
// Extract store name from receipt data
export function extractStoreName(items: any[]): string {
  if (!items || items.length === 0) {
    return "Store";
  }
  
  // Try to get store name from items if available
  for (const item of items) {
    if (item.store && typeof item.store === 'string' && item.store.length > 1) {
      return item.store;
    }
  }
  
  return "Store";
}
