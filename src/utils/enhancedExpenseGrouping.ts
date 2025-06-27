
import { groupSimilarExpenses, getTopSpenders, analyzeSpendingPatterns } from './expenseGrouping';

interface SmartExpenseGroup {
  id: string;
  name: string;
  totalAmount: number;
  frequency: number;
  expenses: any[];
  category: string;
  pattern: 'recurring' | 'similar_items' | 'merchant_based' | 'amount_based';
  insights: string[];
  monthlyAverage: number;
  yearlyProjection: number;
}

// Enhanced text processing for Indian context
function processIndianText(text: string): string[] {
  const processed = text.toLowerCase()
    // Handle common Hindi words in Roman script
    .replace(/paani|pani/g, 'water')
    .replace(/chai|tea/g, 'tea')
    .replace(/khaana|khana/g, 'food')
    .replace(/gaadi|gari/g, 'vehicle')
    .replace(/dukaan|shop/g, 'shop')
    // Handle common abbreviations
    .replace(/&/g, 'and')
    .replace(/w\//g, 'with')
    .replace(/\brs\.?\s*/g, '')
    .replace(/\binr\s*/g, '')
    // Clean emojis and special characters
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, ' ')
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = processed.split(' ').filter(w => w.length > 1);
  
  // Add phonetic variations for common misspellings
  const phoneticVariations: string[] = [];
  words.forEach(word => {
    // Add common Indian English variations
    if (word.includes('ph')) phoneticVariations.push(word.replace('ph', 'f'));
    if (word.includes('tion')) phoneticVariations.push(word.replace('tion', 'shun'));
    // Add common typos
    phoneticVariations.push(word.replace(/ck/g, 'k'));
  });
  
  return [...words, ...phoneticVariations];
}

// Enhanced similarity calculation
function calculateEnhancedSimilarity(desc1: string, desc2: string): number {
  const words1 = processIndianText(desc1);
  const words2 = processIndianText(desc2);
  
  // Jaccard similarity for word sets
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardScore = intersection.size / union.size;
  
  // Boost score for exact merchant matches
  const merchant1 = extractMerchantName(desc1);
  const merchant2 = extractMerchantName(desc2);
  const merchantBonus = merchant1 && merchant2 && merchant1 === merchant2 ? 0.3 : 0;
  
  return Math.min(1, jaccardScore + merchantBonus);
}

// Extract merchant/store names
function extractMerchantName(description: string): string | null {
  const commonMerchants = [
    'swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart',
    'bigbasket', 'grofers', 'dunzo', 'starbucks', 'mcdonalds',
    'kfc', 'dominos', 'pizza hut', 'cafe coffee day', 'barista'
  ];
  
  const lowerDesc = description.toLowerCase();
  for (const merchant of commonMerchants) {
    if (lowerDesc.includes(merchant)) {
      return merchant;
    }
  }
  
  return null;
}

// Create smart expense groups with insights
export function createSmartExpenseGroups(expenses: any[]): SmartExpenseGroup[] {
  const groups: SmartExpenseGroup[] = [];
  
  // First, use existing grouping logic as base
  const baseGrouping = groupSimilarExpenses(expenses);
  
  // Enhance each group with smart insights
  baseGrouping.groups.forEach((group, index) => {
    const monthlyAverage = group.totalAmount;
    const yearlyProjection = monthlyAverage * 12;
    
    const insights: string[] = [];
    
    // Generate insights based on patterns
    if (group.expenses.length > 5) {
      insights.push(`You make similar purchases ${group.expenses.length} times per month`);
    }
    
    if (yearlyProjection > 10000) {
      insights.push(`This category costs you ₹${yearlyProjection.toLocaleString()} annually`);
    }
    
    const avgAmount = group.totalAmount / group.expenses.length;
    if (avgAmount < 200 && group.expenses.length > 4) {
      insights.push(`These small expenses add up - consider bundling or reducing frequency`);
    }
    
    // Check for merchant patterns
    const merchant = extractMerchantName(group.expenses[0].description);
    if (merchant && group.expenses.length > 3) {
      insights.push(`Frequent ${merchant} user - check for subscription options or bulk discounts`);
    }
    
    groups.push({
      id: `smart-group-${index}`,
      name: group.groupName,
      totalAmount: group.totalAmount,
      frequency: group.expenses.length,
      expenses: group.expenses,
      category: group.expenses[0].category,
      pattern: group.expenses.length > 4 ? 'recurring' : 'similar_items',
      insights,
      monthlyAverage,
      yearlyProjection
    });
  });
  
  // Add merchant-based grouping
  const merchantGroups = groupByMerchant(expenses);
  merchantGroups.forEach((merchantGroup, index) => {
    if (merchantGroup.expenses.length > 2) {
      groups.push({
        id: `merchant-group-${index}`,
        name: `${merchantGroup.merchant} Orders`,
        totalAmount: merchantGroup.totalAmount,
        frequency: merchantGroup.expenses.length,
        expenses: merchantGroup.expenses,
        category: merchantGroup.expenses[0].category,
        pattern: 'merchant_based',
        insights: [
          `You order from ${merchantGroup.merchant} ${merchantGroup.expenses.length} times per month`,
          `Annual spending: ₹${(merchantGroup.totalAmount * 12).toLocaleString()}`
        ],
        monthlyAverage: merchantGroup.totalAmount,
        yearlyProjection: merchantGroup.totalAmount * 12
      });
    }
  });
  
  return groups.sort((a, b) => b.totalAmount - a.totalAmount);
}

// Group expenses by recognized merchants
function groupByMerchant(expenses: any[]): Array<{
  merchant: string;
  totalAmount: number;
  expenses: any[];
}> {
  const merchantGroups: Record<string, any[]> = {};
  
  expenses.forEach(expense => {
    const merchant = extractMerchantName(expense.description);
    if (merchant) {
      if (!merchantGroups[merchant]) {
        merchantGroups[merchant] = [];
      }
      merchantGroups[merchant].push(expense);
    }
  });
  
  return Object.entries(merchantGroups).map(([merchant, expenseList]) => ({
    merchant,
    totalAmount: expenseList.reduce((sum, exp) => sum + Number(exp.amount), 0),
    expenses: expenseList
  }));
}

// Detect recurring subscription-like payments
export function detectRecurringPayments(expenses: any[]): Array<{
  name: string;
  amount: number;
  frequency: number;
  category: string;
  expenses: any[];
  isSubscription: boolean;
}> {
  const amountGroups: Record<string, any[]> = {};
  
  // Group by similar amounts (within 10% variance)
  expenses.forEach(expense => {
    const amount = Number(expense.amount);
    const key = Math.round(amount / 100) * 100; // Round to nearest 100
    
    if (!amountGroups[key]) {
      amountGroups[key] = [];
    }
    amountGroups[key].push(expense);
  });
  
  const recurringPayments: Array<{
    name: string;
    amount: number;
    frequency: number;
    category: string;
    expenses: any[];
    isSubscription: boolean;
  }> = [];
  
  Object.entries(amountGroups).forEach(([amountKey, expenseList]) => {
    if (expenseList.length >= 2) {
      const avgAmount = expenseList.reduce((sum, exp) => sum + Number(exp.amount), 0) / expenseList.length;
      
      // Check if it's likely a subscription (regular amount, similar descriptions)
      const descriptions = expenseList.map(exp => exp.description.toLowerCase());
      const uniqueDescriptions = new Set(descriptions);
      const isSubscription = uniqueDescriptions.size <= 2 && expenseList.length >= 3;
      
      recurringPayments.push({
        name: expenseList[0].description,
        amount: avgAmount,
        frequency: expenseList.length,
        category: expenseList[0].category,
        expenses: expenseList,
        isSubscription
      });
    }
  });
  
  return recurringPayments.sort((a, b) => b.amount * b.frequency - a.amount * a.frequency);
}
