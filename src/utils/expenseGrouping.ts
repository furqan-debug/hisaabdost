
interface ExpenseGroup {
  id: string;
  groupName: string;
  totalAmount: number;
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
  topExpense: {
    description: string;
    amount: number;
    date: string;
  };
  pattern: string;
  similarity: number;
}

interface ExpenseGroupingResult {
  groups: ExpenseGroup[];
  ungrouped: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
  totalGrouped: number;
  totalUngrouped: number;
}

// Common expense patterns for different categories
const EXPENSE_PATTERNS = {
  transportation: [
    'petrol', 'gas', 'fuel', 'travel', 'uber', 'taxi', 'bus', 'train', 'metro',
    'parking', 'toll', 'flight', 'booking', 'transport', 'auto', 'rickshaw'
  ],
  food: [
    'restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'grocery', 'market',
    'cafe', 'coffee', 'tea', 'pizza', 'burger', 'meal', 'dining', 'kitchen'
  ],
  utilities: [
    'electricity', 'water', 'internet', 'phone', 'mobile', 'wifi', 'broadband',
    'cable', 'gas', 'bill', 'recharge', 'top up', 'topup'
  ],
  shopping: [
    'store', 'mall', 'shop', 'amazon', 'flipkart', 'online', 'purchase',
    'buy', 'order', 'delivery', 'shopping', 'retail'
  ],
  healthcare: [
    'doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health',
    'clinic', 'treatment', 'checkup', 'prescription'
  ],
  entertainment: [
    'movie', 'cinema', 'game', 'music', 'netflix', 'spotify', 'entertainment',
    'fun', 'party', 'club', 'bar', 'concert'
  ]
};

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Calculate similarity percentage between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const cleanStr1 = str1.toLowerCase().trim();
  const cleanStr2 = str2.toLowerCase().trim();
  
  if (cleanStr1 === cleanStr2) return 100;
  
  const maxLength = Math.max(cleanStr1.length, cleanStr2.length);
  const distance = levenshteinDistance(cleanStr1, cleanStr2);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(similarity);
}

// Extract keywords from expense description
function extractKeywords(description: string): string[] {
  const cleanDesc = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  return cleanDesc;
}

// Check if expenses match common patterns
function matchesPattern(description: string, pattern: string[]): boolean {
  const keywords = extractKeywords(description);
  return keywords.some(keyword => 
    pattern.some(patternWord => 
      keyword.includes(patternWord) || patternWord.includes(keyword)
    )
  );
}

// Find pattern category for expense
function findPatternCategory(description: string): string | null {
  for (const [category, patterns] of Object.entries(EXPENSE_PATTERNS)) {
    if (matchesPattern(description, patterns)) {
      return category;
    }
  }
  return null;
}

// Check if two expenses should be grouped together
function shouldGroup(expense1: any, expense2: any, threshold = 70): boolean {
  // Same category bonus
  const categoryMatch = expense1.category === expense2.category;
  
  // Text similarity
  const textSimilarity = calculateSimilarity(expense1.description, expense2.description);
  
  // Pattern matching
  const pattern1 = findPatternCategory(expense1.description);
  const pattern2 = findPatternCategory(expense2.description);
  const patternMatch = pattern1 && pattern2 && pattern1 === pattern2;
  
  // Keywords overlap
  const keywords1 = extractKeywords(expense1.description);
  const keywords2 = extractKeywords(expense2.description);
  const commonKeywords = keywords1.filter(k => keywords2.includes(k));
  const keywordSimilarity = (commonKeywords.length / Math.max(keywords1.length, keywords2.length)) * 100;
  
  // Calculate final score
  let score = textSimilarity * 0.4;
  if (categoryMatch) score += 20;
  if (patternMatch) score += 25;
  score += keywordSimilarity * 0.35;
  
  return score >= threshold;
}

// Generate group name from similar expenses
function generateGroupName(expenses: any[]): string {
  if (expenses.length === 0) return 'Unknown';
  
  // Try to find pattern category first
  const patternCategory = findPatternCategory(expenses[0].description);
  if (patternCategory) {
    const categoryNames = {
      transportation: 'Transportation & Travel',
      food: 'Food & Dining',
      utilities: 'Utilities & Bills',
      shopping: 'Shopping & Purchases',
      healthcare: 'Healthcare & Medical',
      entertainment: 'Entertainment & Leisure'
    };
    return categoryNames[patternCategory as keyof typeof categoryNames] || 'Miscellaneous';
  }
  
  // Extract most common keywords
  const allKeywords = expenses.flatMap(e => extractKeywords(e.description));
  const keywordCounts = allKeywords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([word]) => word);
  
  if (topKeywords.length > 0) {
    return topKeywords.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' & ') + ' Expenses';
  }
  
  return expenses[0].category + ' Expenses';
}

// Main grouping function
export function groupSimilarExpenses(expenses: any[]): ExpenseGroupingResult {
  const groups: ExpenseGroup[] = [];
  const ungrouped: any[] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < expenses.length; i++) {
    if (processed.has(expenses[i].id)) continue;
    
    const currentExpense = expenses[i];
    const similarExpenses = [currentExpense];
    processed.add(currentExpense.id);
    
    // Find similar expenses
    for (let j = i + 1; j < expenses.length; j++) {
      if (processed.has(expenses[j].id)) continue;
      
      if (shouldGroup(currentExpense, expenses[j])) {
        similarExpenses.push(expenses[j]);
        processed.add(expenses[j].id);
      }
    }
    
    // Group if we found similar expenses
    if (similarExpenses.length > 1) {
      const totalAmount = similarExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const topExpense = similarExpenses.reduce((max, exp) => 
        Number(exp.amount) > Number(max.amount) ? exp : max
      );
      
      groups.push({
        id: `group-${groups.length + 1}`,
        groupName: generateGroupName(similarExpenses),
        totalAmount,
        expenses: similarExpenses,
        topExpense: {
          description: topExpense.description,
          amount: Number(topExpense.amount),
          date: topExpense.date
        },
        pattern: findPatternCategory(currentExpense.description) || 'custom',
        similarity: 85 // Average similarity score
      });
    } else {
      ungrouped.push(currentExpense);
    }
  }
  
  // Sort groups by total amount
  groups.sort((a, b) => b.totalAmount - a.totalAmount);
  
  const totalGrouped = groups.reduce((sum, group) => sum + group.totalAmount, 0);
  const totalUngrouped = ungrouped.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  return {
    groups,
    ungrouped,
    totalGrouped,
    totalUngrouped
  };
}

// Get top spenders across all categories
export function getTopSpenders(expenses: any[], limit = 10): Array<{
  description: string;
  amount: number;
  date: string;
  category: string;
  percentage: number;
}> {
  const totalSpending = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  return expenses
    .map(exp => ({
      description: exp.description,
      amount: Number(exp.amount),
      date: exp.date,
      category: exp.category,
      percentage: (Number(exp.amount) / totalSpending) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

// Analyze spending patterns
export function analyzeSpendingPatterns(expenses: any[]) {
  const patterns = Object.keys(EXPENSE_PATTERNS);
  const patternAnalysis = patterns.map(pattern => {
    const patternExpenses = expenses.filter(exp => 
      matchesPattern(exp.description, EXPENSE_PATTERNS[pattern as keyof typeof EXPENSE_PATTERNS])
    );
    
    const totalAmount = patternExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const count = patternExpenses.length;
    
    return {
      pattern,
      totalAmount,
      count,
      averageAmount: count > 0 ? totalAmount / count : 0,
      expenses: patternExpenses
    };
  });
  
  return patternAnalysis
    .filter(p => p.count > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);
}
