
/**
 * Deduplicate and sort extracted items by price
 */
export function deduplicateItems(items: Array<{name: string; amount: string}>): Array<{name: string; amount: string}> {
  // Create a map to track unique items, using item name as key
  const uniqueItems = new Map<string, {name: string; amount: string}>();
  
  // Process each item
  items.forEach(item => {
    const key = item.name.toLowerCase();
    const amount = parseFloat(item.amount);
    
    // Skip invalid amounts
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    // If this item doesn't exist yet or has a higher price, update it
    if (!uniqueItems.has(key) || parseFloat(uniqueItems.get(key)!.amount) < amount) {
      uniqueItems.set(key, item);
    }
  });
  
  // Convert map back to array and sort by price (highest first)
  return Array.from(uniqueItems.values())
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
}
