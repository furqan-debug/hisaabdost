
// Enhanced expense extraction utilities
export interface ExpenseData {
  amount: number;
  category: string;
  description: string;
  confidence: number;
}

// Common expense keywords mapped to categories
const EXPENSE_KEYWORDS: Record<string, string[]> = {
  "Food": [
    // English
    "food", "eat", "ate", "lunch", "dinner", "breakfast", "snack", "meal", "restaurant", 
    "cafe", "coffee", "pizza", "burger", "sandwich", "grocery", "groceries",
    // Urdu/Hindi
    "khana", "khaya", "nashta", "dophar", "raat", "bakra", "gosht", "chawal", "daal",
    "sabzi", "roti", "naan", "biryani", "karahi", "tikka", "kebab", "chai", "dudh",
    // More food items
    "chicken", "beef", "mutton", "fish", "vegetables", "fruit", "bread", "rice"
  ],
  "Transportation": [
    // English
    "taxi", "uber", "fuel", "gas", "petrol", "bus", "train", "flight", "parking", "toll",
    // Urdu/Hindi
    "rickshaw", "qingqi", "metro", "bus", "gari", "petrol", "diesel", "parking"
  ],
  "Shopping": [
    // English
    "shopping", "clothes", "shirt", "shoes", "buy", "bought", "purchase", "store", "mall",
    // Urdu/Hindi
    "kapray", "jooty", "kharida", "dukan", "bazaar", "market"
  ],
  "Entertainment": [
    // English
    "movie", "cinema", "game", "concert", "show", "ticket", "netflix", "spotify",
    // Urdu/Hindi
    "film", "tamasha", "khel", "ticket"
  ],
  "Health": [
    // English
    "doctor", "medicine", "hospital", "pharmacy", "checkup", "treatment", "dentist",
    // Urdu/Hindi
    "doctor", "dawai", "hospital", "ilaj", "dant"
  ],
  "Utilities": [
    // English
    "electricity", "gas", "water", "internet", "phone", "wifi", "bill",
    // Urdu/Hindi
    "bijli", "gas", "pani", "internet", "phone", "bill"
  ]
};

// Currency patterns
const CURRENCY_PATTERNS = [
  { pattern: /(\d+(?:\.\d+)?)\s*(?:rs|rupees?|₹)/i, multiplier: 1, currency: 'PKR' },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:\$|dollars?|usd)/i, multiplier: 1, currency: 'USD' },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:€|euros?|eur)/i, multiplier: 1, currency: 'EUR' },
  { pattern: /(?:rs|₹)\s*(\d+(?:\.\d+)?)/i, multiplier: 1, currency: 'PKR' },
  { pattern: /\$\s*(\d+(?:\.\d+)?)/i, multiplier: 1, currency: 'USD' },
  { pattern: /€\s*(\d+(?:\.\d+)?)/i, multiplier: 1, currency: 'EUR' }
];

// Extract amount and currency from text
export function extractAmount(text: string): { amount: number; currency: string } | null {
  for (const { pattern, multiplier, currency } of CURRENCY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]) * multiplier;
      return { amount, currency };
    }
  }
  return null;
}

// Determine category based on keywords in the text
export function categorizeExpense(text: string): { category: string; confidence: number } {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Calculate scores for each category
  for (const [category, keywords] of Object.entries(EXPENSE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Give higher score for exact matches and longer keywords
        score += keyword.length * (lowerText.split(keyword.toLowerCase()).length - 1);
      }
    }
    if (score > 0) {
      scores[category] = score;
    }
  }
  
  // Find the category with highest score
  if (Object.keys(scores).length === 0) {
    return { category: "Other", confidence: 0 };
  }
  
  const bestCategory = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];
  
  const maxScore = Math.max(...Object.values(scores));
  const confidence = Math.min(maxScore / 10, 1); // Normalize confidence score
  
  return { category: bestCategory, confidence };
}

// Generate a clean description from the original text
export function generateDescription(text: string, category: string): string {
  const lowerText = text.toLowerCase();
  
  // Remove currency amounts from description
  let cleanText = text;
  for (const { pattern } of CURRENCY_PATTERNS) {
    cleanText = cleanText.replace(pattern, '').trim();
  }
  
  // Common description mappings
  const descriptionMappings: Record<string, string> = {
    "bakra khaya": "Goat meat",
    "gosht khaya": "Meat",
    "chicken khaya": "Chicken",
    "biryani khaya": "Biryani",
    "chai pi": "Tea",
    "coffee pi": "Coffee",
    "petrol dala": "Fuel",
    "rickshaw liya": "Rickshaw ride",
    "dukan se khareeda": "Shopping",
    "kapray kharide": "Clothes shopping"
  };
  
  // Check for direct mappings
  for (const [key, value] of Object.entries(descriptionMappings)) {
    if (lowerText.includes(key)) {
      return value;
    }
  }
  
  // Generate based on category and clean up text
  cleanText = cleanText
    .replace(/\b(ka|ki|ke|se|me|aaj|kal|today|yesterday)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanText.length < 3) {
    return category === "Food" ? "Food expense" : 
           category === "Transportation" ? "Transportation expense" :
           `${category} expense`;
  }
  
  return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
}

// Main extraction function
export function extractExpenseFromMessage(message: string): ExpenseData | null {
  const amountData = extractAmount(message);
  if (!amountData) {
    return null; // No amount found
  }
  
  const categoryData = categorizeExpense(message);
  
  // Only auto-extract if we have reasonable confidence
  if (categoryData.confidence < 0.3) {
    return null;
  }
  
  const description = generateDescription(message, categoryData.category);
  
  return {
    amount: amountData.amount,
    category: categoryData.category,
    description,
    confidence: categoryData.confidence
  };
}

// Check if message seems like an expense (for pre-processing)
export function isExpenseMessage(message: string): boolean {
  const hasAmount = extractAmount(message) !== null;
  const hasExpenseKeywords = Object.values(EXPENSE_KEYWORDS)
    .flat()
    .some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  
  return hasAmount && hasExpenseKeywords;
}
