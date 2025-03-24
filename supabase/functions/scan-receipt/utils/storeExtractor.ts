
// Try to extract store name from the item data
export function extractStoreName(items: any[]) {
  // If we have items with a store property, use that
  for (const item of items) {
    if (item.store && item.store.trim().length > 0) {
      return item.store.trim();
    }
  }
  
  // Default fallback
  return "Store";
}
