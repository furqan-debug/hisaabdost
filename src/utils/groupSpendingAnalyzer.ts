
interface GroupSpendingItem {
  id: string;
  name: string;
  totalAmount: number;
  percentage: number;
  yearlyProjection: number;
  itemCount: number;
  expenses: any[];
  isHarmful: boolean;
  category: string;
  suggestions?: string[];
}

interface GroupSpendingResult {
  groups: GroupSpendingItem[];
  totalSpending: number;
  harmfulSpending: number;
}

// Harmful keywords that trigger red warning cards
const HARMFUL_KEYWORDS = {
  alcohol: ['alcohol', 'beer', 'wine', 'whiskey', 'vodka', 'rum', 'gin', 'cocktail', 'bar', 'pub', 'brewery', 'liquor', 'champagne', 'tequila', 'brandy'],
  tobacco: ['cigarette', 'tobacco', 'smoke', 'cigar', 'vape', 'nicotine'],
  gambling: ['casino', 'bet', 'gambling', 'lottery', 'poker', 'slots', 'jackpot', 'wager']
};

// Smart grouping keywords for better categorization
const SMART_GROUPING_KEYWORDS = {
  'Coffee & Tea': ['coffee', 'tea', 'chai', 'cappuccino', 'latte', 'espresso', 'americano', 'mocha', 'cafe'],
  'Fast Food': ['pizza', 'burger', 'fries', 'sandwich', 'hotdog', 'taco', 'kfc', 'mcdonalds', 'subway'],
  'Transportation': ['taxi', 'uber', 'bus', 'train', 'metro', 'rickshaw', 'fuel', 'petrol', 'gas', 'parking'],
  'Snacks': ['snack', 'chips', 'biscuit', 'cookie', 'candy', 'chocolate', 'nuts', 'popcorn'],
  'Groceries': ['grocery', 'vegetables', 'fruit', 'milk', 'bread', 'rice', 'flour', 'oil', 'sugar'],
  'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'show', 'ticket'],
  'Health & Fitness': ['gym', 'fitness', 'medicine', 'doctor', 'pharmacy', 'vitamin', 'supplement'],
  'Clothing': ['clothes', 'shirt', 'pants', 'shoes', 'dress', 'jacket', 'socks', 'underwear'],
  'Utilities': ['electricity', 'water', 'internet', 'phone', 'wifi', 'gas', 'bill']
};

// Clean and normalize expense descriptions
function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Check if expense contains harmful keywords
function isHarmfulExpense(description: string): boolean {
  const normalized = normalizeDescription(description);
  
  for (const category of Object.values(HARMFUL_KEYWORDS)) {
    if (category.some(keyword => normalized.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

// Find the best group name for an expense
function findGroupName(description: string): string {
  const normalized = normalizeDescription(description);
  
  for (const [groupName, keywords] of Object.entries(SMART_GROUPING_KEYWORDS)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return groupName;
    }
  }
  
  // If no smart group found, use the first meaningful word
  const words = normalized.split(' ').filter(word => word.length > 2);
  if (words.length > 0) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  
  return 'Other';
}

// Calculate similarity between two descriptions (case-insensitive)
function calculateSimilarity(desc1: string, desc2: string): number {
  const norm1 = normalizeDescription(desc1);
  const norm2 = normalizeDescription(desc2);
  
  if (norm1 === norm2) return 1;
  
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return commonWords.length / totalWords;
}

// Generate smart suggestions based on spending patterns
function generateSuggestions(group: GroupSpendingItem): string[] {
  const suggestions: string[] = [];
  
  if (group.percentage > 15) {
    suggestions.push(`This category represents ${group.percentage.toFixed(1)}% of your spending - consider setting a monthly limit`);
  }
  
  if (group.yearlyProjection > 50000) {
    suggestions.push(`At this rate, you'll spend ₹${group.yearlyProjection.toLocaleString()} yearly - look for bulk discounts or alternatives`);
  }
  
  if (group.itemCount > 10) {
    suggestions.push(`You make ${group.itemCount} purchases in this category - consider consolidating trips or bulk buying`);
  }
  
  // Category-specific suggestions
  switch (group.name) {
    case 'Coffee & Tea':
      suggestions.push('Try making coffee/tea at home to save up to 70%');
      break;
    case 'Fast Food':
      suggestions.push('Cooking at home could save ₹20,000+ yearly and improve health');
      break;
    case 'Transportation':
      suggestions.push('Consider monthly passes, carpooling, or bike-sharing options');
      break;
    case 'Entertainment':
      suggestions.push('Look for free events or group discounts to reduce costs');
      break;
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

export function analyzeGroupSpending(expenses: any[]): GroupSpendingResult {
  if (!expenses || expenses.length === 0) {
    return { groups: [], totalSpending: 0, harmfulSpending: 0 };
  }
  
  const totalSpending = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const groupMap = new Map<string, any[]>();
  
  // Group expenses by smart categories
  expenses.forEach(expense => {
    const groupName = findGroupName(expense.description);
    
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    
    groupMap.get(groupName)!.push(expense);
  });
  
  // Create group spending items
  const groups: GroupSpendingItem[] = Array.from(groupMap.entries()).map(([name, expenseList]) => {
    const totalAmount = expenseList.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const percentage = (totalAmount / totalSpending) * 100;
    const yearlyProjection = totalAmount * 12;
    const isHarmful = expenseList.some(exp => isHarmfulExpense(exp.description));
    
    const groupItem: GroupSpendingItem = {
      id: `group-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      totalAmount,
      percentage,
      yearlyProjection,
      itemCount: expenseList.length,
      expenses: expenseList,
      isHarmful,
      category: expenseList[0].category,
    };
    
    groupItem.suggestions = generateSuggestions(groupItem);
    
    return groupItem;
  });
  
  // Sort by total amount (highest first)
  groups.sort((a, b) => b.totalAmount - a.totalAmount);
  
  const harmfulSpending = groups
    .filter(group => group.isHarmful)
    .reduce((sum, group) => sum + group.totalAmount, 0);
  
  return {
    groups,
    totalSpending,
    harmfulSpending
  };
}
