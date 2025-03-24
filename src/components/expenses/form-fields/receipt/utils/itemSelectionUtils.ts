
// Find the most relevant item from a list of extracted items
export function findMainItem(items: any[]): any {
  if (!items || items.length === 0) return null;
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Sort by price (highest first) and return the most expensive item
  const sortedItems = [...items].sort((a, b) => {
    const amountA = parseFloat(a.amount || '0');
    const amountB = parseFloat(b.amount || '0');
    return amountB - amountA;
  });
  
  return sortedItems[0];
}

// Format description with item name and store
export function formatDescription(itemName: string, storeName?: string): string {
  // Clean up item name
  let description = itemName || "Store Purchase";
  
  // Remove common prefixes and codes
  description = description
    .replace(/^item[:.\s-]+/i, '')
    .replace(/^product[:.\s-]+/i, '')
    .replace(/^[a-z]{1,3}\d{4,}[:.\s-]*/i, '') // Remove SKU/UPC codes
    .replace(/^\d+\s+/, ''); // Remove leading numbers
  
  // Truncate very long descriptions
  if (description.length > 50) {
    description = description.substring(0, 50);
  }
  
  // Capitalize first letter
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }
  
  // Add store name if significant and different from item name
  if (storeName && 
      storeName !== "Store" && 
      storeName !== "Unknown" && 
      !description.toLowerCase().includes(storeName.toLowerCase())) {
    // Only add store name if description isn't already too long
    if (description.length < 30) {
      description = `${description} from ${storeName}`;
    }
  }
  
  return description;
}
