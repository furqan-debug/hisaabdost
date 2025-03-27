// Improved Date Extraction
export function extractDate(text: string): string | null {
  const datePatterns = [
    /\b(\d{4}[-/]\d{2}[-/]\d{2})\b/, // YYYY-MM-DD or YYYY/MM/DD
    /\b(\d{2}[-/]\d{2}[-/]\d{4})\b/, // MM-DD-YYYY or MM/DD/YYYY
    /\b(\d{2}[-/]\d{2}[-/]\d{2})\b/ // MM-DD-YY or MM/DD/YY
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Improved Amount Extraction
export function extractAmounts(lines: string[]): { name: string; amount: number }[] {
  const items: { name: string; amount: number }[] = [];
  const amountPattern = /([\w\s]+?)\s+([\d]+\.?\d{0,2})$/;
  
  for (const line of lines) {
    const match = line.match(amountPattern);
    if (match) {
      const itemName = match[1].trim();
      const amount = parseFloat(match[2]);
      if (!isNaN(amount)) {
        items.push({ name: itemName, amount });
      }
    }
  }
  return items;
}

// Auto-Categorization of Expenses
function categorizeExpense(itemName: string): string {
  const categories: Record<string, string[]> = {
    grocery: ["milk", "bread", "eggs", "supermarket"],
    food: ["burger", "pizza", "coffee", "restaurant"],
    transport: ["uber", "taxi", "gas", "bus"],
    shopping: ["clothing", "electronics", "mall", "amazon"]
  };

  const itemLower = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => itemLower.includes(keyword))) {
      return category;
    }
  }
  return "uncategorized";
}

// Process Receipt Text
export function processReceiptText(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const date = extractDate(text);
  const items = extractAmounts(lines).map(item => ({
    name: item.name,
    amount: item.amount,
    category: categorizeExpense(item.name)
  }));

  return {
    date,
    items,
    success: true
  };
}
