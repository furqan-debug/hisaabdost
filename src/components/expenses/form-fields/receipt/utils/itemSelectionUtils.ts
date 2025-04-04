
/**
 * Selects the main item from an array of receipt items
 * Typically chooses the most expensive item or the first item if amounts are equal
 */
export function selectMainItem(items: any[]): any {
  if (!items || items.length === 0) {
    console.log("No items to select from");
    return {
      description: "Store Purchase",
      amount: "0.00",
      date: new Date().toISOString().split('T')[0],
      category: "Other",
      paymentMethod: "Card"
    };
  }
  
  console.log(`Selecting main item from ${items.length} items:`, items);
  
  // If we only have one item, return it
  if (items.length === 1) {
    console.log("Only one item, returning it", items[0]);
    return items[0];
  }
  
  // Find the item with the highest amount
  let highestItem = items[0];
  let highestAmount = parseFloat(String(items[0].amount || 0).replace(/[^0-9.]/g, '')) || 0;
  
  for (const item of items) {
    const amount = parseFloat(String(item.amount || 0).replace(/[^0-9.]/g, '')) || 0;
    if (amount > highestAmount) {
      highestAmount = amount;
      highestItem = item;
    }
  }
  
  console.log("Selected main item:", highestItem);
  return highestItem;
}
