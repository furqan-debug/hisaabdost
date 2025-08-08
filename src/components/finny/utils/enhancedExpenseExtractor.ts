
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';

export interface EnhancedExpenseData {
  amount: number;
  category: string;
  description: string;
  confidence: number;
  date?: string;
  isRecurring?: boolean;
  suggestedTags?: string[];
}

export interface BudgetData {
  amount: number;
  category: string;
  period: 'monthly' | 'weekly' | 'yearly';
  confidence: number;
}

export interface GoalData {
  title: string;
  amount: number;
  deadline?: string;
  category: string;
  confidence: number;
}

export class EnhancedExtractor {
  // Enhanced expense patterns with more variations
  private static expensePatterns = [
    // Currency patterns
    /(?:spent|paid|cost|bought|purchase[d]?|got)\s*(?:about\s*)?[$£€¥₹](\d+(?:\.\d{2})?)\s*(?:on\s*)?(?:for\s*)?(.+)/i,
    /[$£€¥₹](\d+(?:\.\d{2})?)\s*(?:for\s*|on\s*)?(.+)/i,
    /(\d+(?:\.\d{2})?)\s*(?:dollars?|bucks|usd|eur|gbp)\s*(?:for\s*|on\s*)?(.+)/i,
    
    // Natural language patterns
    /(?:i\s*)?(?:spent|paid|cost|bought)\s*(\d+(?:\.\d{2})?)\s*(?:on\s*|for\s*)?(.+)/i,
    /(.+)\s*(?:cost|was)\s*(\d+(?:\.\d{2})?)/i,
    /(?:add|record)\s*(?:expense\s*)?(?:of\s*)?(\d+(?:\.\d{2})?)\s*(?:for\s*)?(.+)/i
  ];

  // Budget patterns
  private static budgetPatterns = [
    /set\s*(?:a\s*)?(?:monthly\s*|weekly\s*|yearly\s*)?budget\s*(?:of\s*)?[$£€¥₹]?(\d+(?:\.\d{2})?)\s*(?:for\s*)?(.+)/i,
    /budget\s*[$£€¥₹]?(\d+(?:\.\d{2})?)\s*(?:for\s*)?(.+)/i,
    /(?:monthly\s*|weekly\s*|yearly\s*)?limit\s*(?:of\s*)?[$£€¥₹]?(\d+(?:\.\d{2})?)\s*(?:for\s*)?(.+)/i
  ];

  // Goal patterns
  private static goalPatterns = [
    /(?:save|goal|target)\s*[$£€¥₹]?(\d+(?:\.\d{2})?)\s*(?:for\s*|by\s*)(.+)/i,
    /(?:want\s*to\s*)?save\s*(?:up\s*)?(?:to\s*)?[$£€¥₹]?(\d+(?:\.\d{2})?)\s*(?:for\s*)?(.+)/i,
    /goal\s*(?:of\s*)?[$£€¥₹]?(\d+(?:\.\d{2})?)\s*(.+)/i
  ];

  static extractExpense(message: string): EnhancedExpenseData | null {
    const lowerMessage = message.toLowerCase().trim();
    
    for (const pattern of this.expensePatterns) {
      const match = message.match(pattern);
      if (match) {
        let amount: number;
        let description: string;
        
        // Handle different capture group orders
        if (pattern.source.includes('(\d+') && pattern.source.indexOf('(\d+') < pattern.source.indexOf('(.+')) {
          amount = parseFloat(match[1]);
          description = match[2]?.trim() || 'Expense';
        } else {
          amount = parseFloat(match[2]);
          description = match[1]?.trim() || 'Expense';
        }
        
        if (isNaN(amount) || amount <= 0) continue;
        
        // Clean up description
        description = this.cleanDescription(description);
        
        // Determine category
        const category = this.determineCategory(description, lowerMessage);
        
        // Calculate confidence based on pattern specificity
        let confidence = 0.7;
        if (message.includes('$') || message.includes('spent') || message.includes('paid')) {
          confidence += 0.2;
        }
        if (category !== 'Other') {
          confidence += 0.1;
        }
        
        // Check for date mentions
        const date = this.extractDate(message);
        
        // Check for recurring indicators
        const isRecurring = this.checkRecurring(lowerMessage);
        
        return {
          amount,
          category,
          description,
          confidence: Math.min(confidence, 1.0),
          date,
          isRecurring,
          suggestedTags: this.generateTags(description, category)
        };
      }
    }
    
    return null;
  }
  
  static extractBudget(message: string): BudgetData | null {
    for (const pattern of this.budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const categoryText = match[2]?.trim() || '';
        
        if (isNaN(amount) || amount <= 0) continue;
        
        const category = this.determineCategory(categoryText, message.toLowerCase());
        const period = this.determinePeriod(message);
        
        return {
          amount,
          category,
          period,
          confidence: 0.8
        };
      }
    }
    
    return null;
  }
  
  static extractGoal(message: string): GoalData | null {
    for (const pattern of this.goalPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const goalText = match[2]?.trim() || 'Savings Goal';
        
        if (isNaN(amount) || amount <= 0) continue;
        
        const deadline = this.extractDeadline(message);
        
        return {
          title: this.cleanDescription(goalText),
          amount,
          deadline,
          category: 'Savings',
          confidence: 0.7
        };
      }
    }
    
    return null;
  }
  
  private static cleanDescription(desc: string): string {
    // Remove common noise words and clean up
    return desc
      .replace(/^(for|on|at|in|the|a|an)\s+/i, '')
      .replace(/\s+(today|yesterday|now)$/i, '')
      .replace(/[.,!?;]+$/, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  private static determineCategory(text: string, fullMessage: string): string {
    const lowerText = (text + ' ' + fullMessage).toLowerCase();
    
    // Category mapping with enhanced keywords
    const categoryMap: Record<string, string[]> = {
      'Food': ['food', 'lunch', 'dinner', 'breakfast', 'coffee', 'restaurant', 'eat', 'meal', 'snack', 'grocery', 'groceries', 'pizza', 'burger', 'chicken', 'rice', 'bread'],
      'Transportation': ['gas', 'fuel', 'petrol', 'transport', 'uber', 'taxi', 'bus', 'train', 'car', 'parking', 'toll', 'metro', 'subway'],
      'Entertainment': ['movie', 'cinema', 'game', 'concert', 'show', 'entertainment', 'netflix', 'spotify', 'gaming', 'party', 'club'],
      'Shopping': ['shopping', 'clothes', 'shoes', 'shirt', 'dress', 'purchase', 'buy', 'bought', 'store', 'mall', 'amazon'],
      'Utilities': ['electricity', 'water', 'internet', 'phone', 'bill', 'utility', 'wifi', 'mobile', 'cable'],
      'Healthcare': ['doctor', 'medicine', 'pharmacy', 'medical', 'health', 'hospital', 'dentist', 'checkup'],
      'Rent': ['rent', 'rental', 'housing', 'apartment', 'house', 'mortgage', 'lease']
    };
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }
  
  private static determinePeriod(message: string): 'monthly' | 'weekly' | 'yearly' {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('week')) return 'weekly';
    if (lowerMessage.includes('year')) return 'yearly';
    return 'monthly'; // default
  }
  
  private static extractDate(message: string): string | undefined {
    const today = new Date().toISOString().split('T')[0];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('today') || lowerMessage.includes('now')) {
      return today;
    }
    
    if (lowerMessage.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    
    // Could add more sophisticated date parsing here
    return undefined;
  }
  
  private static extractDeadline(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('end of year') || lowerMessage.includes('december')) {
      return `${new Date().getFullYear()}-12-31`;
    }
    
    if (lowerMessage.includes('next month')) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().split('T')[0];
    }
    
    // Could add more sophisticated deadline parsing here
    return undefined;
  }
  
  private static checkRecurring(message: string): boolean {
    const recurringWords = ['daily', 'weekly', 'monthly', 'every', 'recurring', 'regular'];
    return recurringWords.some(word => message.includes(word));
  }
  
  private static generateTags(description: string, category: string): string[] {
    const tags: string[] = [category.toLowerCase()];
    
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('urgent')) tags.push('urgent');
    if (lowerDesc.includes('essential')) tags.push('essential');
    if (lowerDesc.includes('work')) tags.push('work-related');
    
    return tags;
  }
}
