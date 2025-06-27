
interface WastageAlert {
  id: string;
  type: 'frequent_small' | 'recurring_unnecessary' | 'impulse_spending';
  title: string;
  description: string;
  totalAmount: number;
  frequency: number;
  monthlyImpact: number;
  yearlyImpact: number;
  severity: 'low' | 'medium' | 'high';
  expenses: any[];
  suggestion: string;
}

interface WastagePattern {
  pattern: string;
  keywords: string[];
  category: string;
  isWastage: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Define wastage patterns for different expense types
const WASTAGE_PATTERNS: WastagePattern[] = [
  {
    pattern: 'cigarettes',
    keywords: ['cigarette', 'ciggy', 'smoke', 'marlboro', 'gold flake', 'classic', 'bidi', '🚬'],
    category: 'Entertainment',
    isWastage: true,
    priority: 'high'
  },
  {
    pattern: 'alcohol',
    keywords: ['beer', 'wine', 'whisky', 'vodka', 'rum', 'drink', 'bar', 'pub', '🍺', '🍷', '🥃'],
    category: 'Entertainment',
    isWastage: true,
    priority: 'medium'
  },
  {
    pattern: 'coffee_shop',
    keywords: ['starbucks', 'cafe coffee day', 'barista', 'costa', 'coffee', 'latte', 'cappuccino', '☕'],
    category: 'Food',
    isWastage: true,
    priority: 'medium'
  },
  {
    pattern: 'fast_food',
    keywords: ['mcdonalds', 'kfc', 'pizza hut', 'dominos', 'burger king', 'subway', 'fast food', '🍔', '🍕'],
    category: 'Food',
    isWastage: true,
    priority: 'medium'
  },
  {
    pattern: 'snacks',
    keywords: ['chips', 'chocolate', 'candy', 'biscuits', 'cookies', 'namkeen', 'sweets', '🍫', '🍪'],
    category: 'Food',
    isWastage: true,
    priority: 'low'
  },
  {
    pattern: 'impulse_shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'online shopping', 'sale', 'offer'],
    category: 'Shopping',
    isWastage: false, // Depends on frequency and amount
    priority: 'low'
  }
];

// Enhanced text processing for multi-language support
function processText(text: string): string[] {
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ') // Keep English, Hindi, and emojis
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract individual words and common phrases
  const words = cleanText.split(' ');
  const phrases: string[] = [];
  
  // Add 2-word combinations
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  
  return [...words, ...phrases].filter(w => w.length > 1);
}

// Check if expense matches wastage pattern
function matchesWastagePattern(description: string, pattern: WastagePattern): boolean {
  const processedText = processText(description);
  return pattern.keywords.some(keyword => 
    processedText.some(text => 
      text.includes(keyword) || keyword.includes(text)
    )
  );
}

// Detect wastage patterns in expenses
export function detectWastagePatterns(expenses: any[]): WastageAlert[] {
  const alerts: WastageAlert[] = [];
  const patternGroups: Record<string, any[]> = {};
  
  // Group expenses by wastage patterns
  expenses.forEach(expense => {
    WASTAGE_PATTERNS.forEach(pattern => {
      if (matchesWastagePattern(expense.description, pattern)) {
        if (!patternGroups[pattern.pattern]) {
          patternGroups[pattern.pattern] = [];
        }
        patternGroups[pattern.pattern].push({
          ...expense,
          pattern: pattern.pattern,
          patternData: pattern
        });
      }
    });
  });
  
  // Create alerts for significant patterns
  Object.entries(patternGroups).forEach(([patternKey, groupExpenses]) => {
    const pattern = WASTAGE_PATTERNS.find(p => p.pattern === patternKey)!;
    const totalAmount = groupExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const frequency = groupExpenses.length;
    
    // Only create alerts for patterns with significant impact
    if (frequency >= 3 || totalAmount > 500) {
      const monthlyImpact = totalAmount;
      const yearlyImpact = monthlyImpact * 12;
      
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (yearlyImpact > 10000 || pattern.priority === 'high') severity = 'high';
      else if (yearlyImpact > 5000 || pattern.priority === 'medium') severity = 'medium';
      
      alerts.push({
        id: `wastage-${patternKey}`,
        type: 'frequent_small',
        title: getWastageTitle(pattern.pattern, frequency),
        description: getWastageDescription(pattern.pattern, totalAmount, frequency),
        totalAmount,
        frequency,
        monthlyImpact,
        yearlyImpact,
        severity,
        expenses: groupExpenses,
        suggestion: generateWastageSuggestion(pattern.pattern, monthlyImpact, yearlyImpact)
      });
    }
  });
  
  return alerts.sort((a, b) => b.yearlyImpact - a.yearlyImpact);
}

function getWastageTitle(pattern: string, frequency: number): string {
  const titles: Record<string, string> = {
    cigarettes: `🚬 Smoking Expenses (${frequency} purchases)`,
    alcohol: `🍺 Alcohol Spending (${frequency} times)`,
    coffee_shop: `☕ Coffee Shop Visits (${frequency} times)`,
    fast_food: `🍔 Fast Food Orders (${frequency} times)`,
    snacks: `🍫 Snack Purchases (${frequency} times)`,
    impulse_shopping: `🛍️ Impulse Shopping (${frequency} orders)`
  };
  
  return titles[pattern] || `Frequent ${pattern} (${frequency} times)`;
}

function getWastageDescription(pattern: string, amount: number, frequency: number): string {
  const descriptions: Record<string, string> = {
    cigarettes: `You've spent on cigarettes ${frequency} times this month`,
    alcohol: `You've purchased alcohol ${frequency} times this month`,
    coffee_shop: `You've visited coffee shops ${frequency} times this month`,
    fast_food: `You've ordered fast food ${frequency} times this month`,
    snacks: `You've bought snacks ${frequency} times this month`,
    impulse_shopping: `You've made ${frequency} impulse purchases this month`
  };
  
  return descriptions[pattern] || `You've made ${frequency} similar purchases this month`;
}

function generateWastageSuggestion(pattern: string, monthlyAmount: number, yearlyAmount: number): string {
  const suggestions: Record<string, string> = {
    cigarettes: `Consider quitting or reducing smoking. This could save you ₹${yearlyAmount.toLocaleString()} per year and improve your health significantly.`,
    alcohol: `Try limiting alcohol purchases to special occasions. You could save ₹${yearlyAmount.toLocaleString()} annually.`,
    coffee_shop: `Make coffee at home instead. Investing ₹2,000 in a good coffee maker could save you ₹${(yearlyAmount - 2000).toLocaleString()} per year.`,
    fast_food: `Cook more meals at home. You could save ₹${yearlyAmount.toLocaleString()} yearly and eat healthier.`,
    snacks: `Buy snacks in bulk or choose healthier alternatives. Potential savings: ₹${yearlyAmount.toLocaleString()} per year.`,
    impulse_shopping: `Try the 24-hour rule before buying non-essentials. You could save ₹${yearlyAmount.toLocaleString()} annually.`
  };
  
  return suggestions[pattern] || `Reducing these expenses could save you ₹${yearlyAmount.toLocaleString()} per year.`;
}

// Detect frequent small expenses that add up
export function detectFrequentSmallExpenses(expenses: any[], threshold = 200): WastageAlert[] {
  const smallExpenses = expenses.filter(exp => Number(exp.amount) <= threshold);
  const groupedByDescription: Record<string, any[]> = {};
  
  // Group similar small expenses
  smallExpenses.forEach(expense => {
    const key = expense.description.toLowerCase().trim();
    if (!groupedByDescription[key]) {
      groupedByDescription[key] = [];
    }
    groupedByDescription[key].push(expense);
  });
  
  const alerts: WastageAlert[] = [];
  
  Object.entries(groupedByDescription).forEach(([description, expenseGroup]) => {
    if (expenseGroup.length >= 4) { // Appears 4+ times
      const totalAmount = expenseGroup.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const yearlyImpact = totalAmount * 12;
      
      if (yearlyImpact > 1000) { // Only alert if yearly impact > 1000
        alerts.push({
          id: `frequent-${description.replace(/\s+/g, '-')}`,
          type: 'frequent_small',
          title: `💸 Frequent Small Expense`,
          description: `"${description}" appears ${expenseGroup.length} times`,
          totalAmount,
          frequency: expenseGroup.length,
          monthlyImpact: totalAmount,
          yearlyImpact,
          severity: yearlyImpact > 5000 ? 'high' : yearlyImpact > 2000 ? 'medium' : 'low',
          expenses: expenseGroup,
          suggestion: `These small expenses add up to ₹${yearlyImpact.toLocaleString()} yearly. Consider if they're truly necessary.`
        });
      }
    }
  });
  
  return alerts.sort((a, b) => b.yearlyImpact - a.yearlyImpact);
}
