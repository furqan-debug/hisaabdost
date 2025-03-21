
// Check if a line should be skipped
export function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Skip common receipt headers and metadata
  if (lowerLine.includes("receipt") ||
      lowerLine.includes("invoice") ||
      lowerLine.includes("store #") || 
      lowerLine.includes("tel:") || 
      lowerLine.includes("thank you") ||
      lowerLine.includes("subtotal") ||
      lowerLine.includes("total") ||
      lowerLine.includes("change") ||
      lowerLine.includes("cash") ||
      lowerLine.includes("card") ||
      lowerLine.includes("payment") ||
      lowerLine.includes("tax") ||
      lowerLine.includes("date") ||
      lowerLine.includes("time") ||
      lowerLine.includes("welcome") ||
      lowerLine.includes("customer") ||
      lowerLine.includes("copy") ||
      lowerLine.includes("store:") ||
      lowerLine.includes("tran:") ||
      lowerLine.includes("phone") ||
      lowerLine.includes("transaction")) {
    return true;
  }
  
  // Skip lines that are just decorative
  if (line.match(/^[\-=*]{3,}$/)) {
    return true;
  }
  
  return false;
}

// Check if text is non-item text
export function isNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('total') || 
         lowerText.includes('subtotal') || 
         lowerText.includes('tax') || 
         lowerText.includes('amount') || 
         lowerText.includes('price') || 
         lowerText === 'item' || 
         lowerText.includes('description') ||
         lowerText.includes('quantity') ||
         lowerText.length < 2 ||
         lowerText.includes('date') ||
         lowerText.includes('time') ||
         lowerText.includes('receipt') ||
         lowerText.includes('store') ||
         lowerText.includes('customer') ||
         lowerText.includes('copy') ||
         lowerText.includes('thank you');
}

// Deduplicate items
export function deduplicateItems(items: Array<{name: string; amount: string; category: string}>): Array<{name: string; amount: string; category: string}> {
  const uniqueItems = new Map<string, {name: string; amount: string; category: string}>();
  
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
