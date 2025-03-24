
// Check if a line should be skipped (not an item)
export function shouldSkipLine(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  // Common non-item keywords
  const nonItemKeywords = [
    'total', 'subtotal', 'tax', 'change', 'cash', 'card', 'credit', 'debit',
    'balance', 'due', 'payment', 'receipt', 'order', 'transaction', 'thank you',
    'welcome', 'discount', 'savings', 'points', 'rewards', 'store', 'tel:',
    'phone', 'address', 'website', 'www', 'http', 'promotion', 'member'
  ];
  
  // Check for non-item keywords
  for (const keyword of nonItemKeywords) {
    if (lowerLine.includes(keyword)) {
      return true;
    }
  }
  
  // Skip lines that are just numbers, dashes, etc.
  if (lowerLine.match(/^\d+$/) || lowerLine.match(/^[-=*]+$/)) {
    return true;
  }
  
  // Skip very short lines (likely not items)
  if (lowerLine.length < 3) {
    return true;
  }
  
  return false;
}

// Check if text is likely non-item text
export function isNonItemText(name: string): boolean {
  const lowerName = name.toLowerCase();
  
  // Common non-item phrases
  const nonItemPhrases = [
    'subtotal', 'total', 'tax', 'discount', 'coupon', 'change', 'balance', 
    'receipt', 'cashier', 'date', 'time', 'order', 'item', 'qty', 'quantity',
    'price', 'amount', 'payment', 'thank you', 'thanks', 'please', 'cash',
    'card', 'void', 'debit', 'credit', 'approved', 'paid', 'due'
  ];
  
  // Check for non-item phrases
  for (const phrase of nonItemPhrases) {
    if (lowerName.includes(phrase)) {
      return true;
    }
  }
  
  // Skip very short names
  if (lowerName.length < 2) {
    return true;
  }
  
  // Skip if just numbers or special characters
  if (!/[a-z]/i.test(lowerName)) {
    return true;
  }
  
  return false;
}

// Deduplicate and sort items by price
export function deduplicateItems(items: Array<{name: string; amount: string; category: string}>): Array<{name: string; amount: string; category: string}> {
  // Create a map to track unique items, using item name as key
  const uniqueItems = new Map<string, {name: string; amount: string; category: string}>();
  
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
