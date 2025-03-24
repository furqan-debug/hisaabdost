
// Check if a line should be skipped (not an item)
export function shouldSkipLine(line: string): boolean {
  // Common text patterns that are not items
  const nonItemPatterns = [
    /^subtotal/i,
    /^total/i,
    /^balance/i,
    /^change/i,
    /^tax/i,
    /^vat/i,
    /^gst/i,
    /^hst/i,
    /^discount/i,
    /^payment/i,
    /^pay/i,
    /^cash/i,
    /^card/i,
    /^credit/i,
    /^debit/i,
    /^visa/i,
    /^mastercard/i,
    /^amex/i,
    /^american express/i,
    /^paypal/i,
    /^receipt/i,
    /^invoice/i,
    /^date/i,
    /^time/i,
    /^terminal/i,
    /^merchant/i,
    /^store/i,
    /^address/i,
    /^tel/i,
    /^phone/i,
    /^fax/i,
    /^email/i,
    /^web/i,
    /^url/i,
    /^www\./i,
    /^http/i,
    /^thank/i,
    /^welcome/i,
    /^customer/i,
    /^order/i,
    /^item\s*$/i,
    /^qty\s*$/i,
    /^description\s*$/i,
    /^price\s*$/i,
    /^amount\s*$/i,
    /^please/i,
    /^have/i,
    /^nice/i,
    /^day/i,
    /^return/i,
    /^policy/i,
    /^register/i,
    /^clerk/i,
    /^cashier/i,
    /^employee/i,
    /^transaction/i,
    /^loyalty/i,
    /^points/i,
    /^rewards/i,
    /^account/i,
    /^balance/i,
    /^due/i,
    /^id\s*:/i,
    /^no\s*:/i,
    /^number\s*:/i,
    /^ref\s*:/i
  ];
  
  // Check if the line matches any non-item pattern
  for (const pattern of nonItemPatterns) {
    if (line.match(pattern)) {
      return true;
    }
  }
  
  // Check for lines that are just numbers or very short
  if (line.match(/^\d+$/) || line.length < 3) {
    return true;
  }
  
  // Lines with only special characters
  if (line.match(/^[^a-zA-Z0-9]+$/)) {
    return true;
  }
  
  return false;
}

// Check if text is common non-item text
export function isNonItemText(text: string): boolean {
  return shouldSkipLine(text.toLowerCase());
}

// Remove duplicate items
export function deduplicateItems(items: Array<{name: string; amount: string; category: string; date?: string}>): Array<{name: string; amount: string; category: string; date?: string}> {
  // Create a map to store unique items
  const uniqueItems = new Map();
  
  // Process each item
  for (const item of items) {
    // Create a key based on name and amount
    const key = `${item.name.toLowerCase()}|${item.amount}`;
    
    // Only add if not already in map
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, item);
    }
  }
  
  // Convert map values back to array
  const dedupedItems = Array.from(uniqueItems.values());
  
  // Sort items by amount (highest first)
  dedupedItems.sort((a, b) => {
    const amountA = parseFloat(a.amount);
    const amountB = parseFloat(b.amount);
    return amountB - amountA;
  });
  
  return dedupedItems;
}
