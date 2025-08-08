
// Enhanced expense extraction utilities
export interface ExpenseData {
  amount: number;
  category: string;
  description: string;
  confidence: number;
}

// Predefined expense categories - only these are allowed
const PREDEFINED_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities", 
  "Transportation",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Other"
];

// Common expense keywords mapped to categories with clean descriptions
const EXPENSE_KEYWORDS: Record<string, { category: string; keywords: string[]; cleanNames: Record<string, string> }> = {
  "Food": {
    category: "Food",
    keywords: [
      // English
      "food", "eat", "ate", "lunch", "dinner", "breakfast", "snack", "meal", "restaurant", 
      "cafe", "coffee", "pizza", "burger", "sandwich", "grocery", "groceries", "chicken",
      "beef", "mutton", "fish", "vegetables", "fruit", "bread", "rice",
      // Urdu/Hindi
      "khana", "khaya", "nashta", "dophar", "raat", "bakra", "gosht", "chawal", "daal",
      "sabzi", "roti", "naan", "biryani", "karahi", "tikka", "kebab", "chai", "dudh"
    ],
    cleanNames: {
      "bakra": "Goat",
      "bakra khaya": "Goat",
      "gosht": "Meat", 
      "gosht khaya": "Meat",
      "chicken": "Chicken",
      "chicken khaya": "Chicken",
      "biryani": "Biryani",
      "biryani khaya": "Biryani", 
      "chai": "Tea",
      "chai pi": "Tea",
      "coffee": "Coffee",
      "pizza": "Pizza",
      "burger": "Burger",
      "lunch": "Lunch",
      "dinner": "Dinner", 
      "breakfast": "Breakfast",
      "grocery": "Groceries",
      "groceries": "Groceries"
    }
  },
  "Transportation": {
    category: "Transportation",
    keywords: [
      // English
      "taxi", "uber", "fuel", "gas", "petrol", "bus", "train", "flight", "parking", "toll",
      // Urdu/Hindi
      "rickshaw", "qingqi", "metro", "bus", "gari", "petrol", "diesel"
    ],
    cleanNames: {
      "petrol": "Petrol",
      "petrol dala": "Petrol",
      "petrol dalwaya": "Petrol",
      "fuel": "Fuel",
      "gas": "Gas", 
      "taxi": "Taxi",
      "uber": "Uber",
      "rickshaw": "Rickshaw",
      "bus": "Bus",
      "parking": "Parking"
    }
  },
  "Shopping": {
    category: "Shopping", 
    keywords: [
      // English
      "shopping", "clothes", "shirt", "shoes", "buy", "bought", "purchase", "store", "mall",
      // Urdu/Hindi
      "kapray", "jooty", "kharida", "dukan", "bazaar", "market"
    ],
    cleanNames: {
      "shopping": "Shopping",
      "clothes": "Clothes",
      "kapray": "Clothes",
      "shoes": "Shoes", 
      "jooty": "Shoes",
      "shirt": "Shirt"
    }
  },
  "Entertainment": {
    category: "Entertainment",
    keywords: [
      // English 
      "movie", "cinema", "game", "concert", "show", "ticket", "netflix", "spotify",
      // Urdu/Hindi
      "film", "tamasha", "khel", "ticket"
    ],
    cleanNames: {
      "movie": "Movie",
      "cinema": "Cinema",
      "film": "Movie",
      "game": "Game",
      "ticket": "Ticket"
    }
  },
  "Utilities": {
    category: "Utilities",
    keywords: [
      // English
      "electricity", "gas", "water", "internet", "phone", "wifi", "bill",
      // Urdu/Hindi 
      "bijli", "gas", "pani", "internet", "phone", "bill"
    ],
    cleanNames: {
      "electricity": "Electricity",
      "bijli": "Electricity", 
      "water": "Water",
      "pani": "Water",
      "internet": "Internet",
      "phone": "Phone",
      "bill": "Bill"
    }
  },
  "Rent": {
    category: "Rent",
    keywords: [
      // English
      "rent", "mortgage", "house", "apartment", "condo", "housing", "property"
    ],
    cleanNames: {
      "rent": "Rent",
      "mortgage": "Mortgage",
      "house": "House",
      "apartment": "Apartment"
    }
  },
  "Healthcare": {
    category: "Healthcare",
    keywords: [
      // English
      "doctor", "medical", "medicine", "health", "dental", "vision", "prescription", 
      "drug", "fitness", "gym", "exercise", "vitamin", "supplement", "therapy", 
      "hospital", "clinic", "insurance"
    ],
    cleanNames: {
      "doctor": "Doctor",
      "medical": "Medical",
      "medicine": "Medicine",
      "health": "Health",
      "dental": "Dental",
      "fitness": "Fitness",
      "gym": "Gym"
    }
  }
};

// Currency patterns for amount extraction
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
  
  // Calculate scores for each predefined category
  for (const [categoryName, categoryData] of Object.entries(EXPENSE_KEYWORDS)) {
    let score = 0;
    for (const keyword of categoryData.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Give higher score for exact matches and longer keywords
        score += keyword.length * (lowerText.split(keyword.toLowerCase()).length - 1);
      }
    }
    if (score > 0) {
      scores[categoryName] = score;
    }
  }
  
  // Find the category with highest score
  if (Object.keys(scores).length === 0) {
    return { category: "Other", confidence: 0 };
  }
  
  const bestCategory = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];
  
  // Only return categories that are in our predefined list
  if (!PREDEFINED_CATEGORIES.includes(bestCategory)) {
    return { category: "Other", confidence: 0 };
  }
  
  const maxScore = Math.max(...Object.values(scores));
  const confidence = Math.min(maxScore / 10, 1); // Normalize confidence score
  
  return { category: bestCategory, confidence };
}

// Generate a clean, short description from the original text
export function generateDescription(text: string, category: string): string {
  const lowerText = text.toLowerCase();
  
  // Find the category data
  const categoryData = EXPENSE_KEYWORDS[category];
  if (!categoryData) {
    return category; // Fallback to category name
  }
  
  // Check for direct clean name mappings
  for (const [key, cleanName] of Object.entries(categoryData.cleanNames)) {
    if (lowerText.includes(key.toLowerCase())) {
      return cleanName;
    }
  }
  
  // Check for keyword matches and return clean names
  for (const keyword of categoryData.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      const cleanName = categoryData.cleanNames[keyword];
      if (cleanName) {
        return cleanName;
      }
      // If no clean name mapping, capitalize the keyword
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  // Fallback to category name if no specific item found
  return category;
}

// Main extraction function
export function extractExpenseFromMessage(message: string): ExpenseData | null {
  const amountData = extractAmount(message);
  if (!amountData) {
    return null; // No amount found
  }
  
  const categoryData = categorizeExpense(message);
  
  // Only auto-extract if we have reasonable confidence and it's a predefined category
  if (categoryData.confidence < 0.3 || !PREDEFINED_CATEGORIES.includes(categoryData.category)) {
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
    .flatMap(cat => cat.keywords)
    .some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  
  return hasAmount && hasExpenseKeywords;
}
