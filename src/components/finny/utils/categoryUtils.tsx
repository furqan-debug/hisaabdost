import { getCategoryNames, LEGACY_CATEGORY_MAP } from '@/config/categories';

export const validateCategory = (category: string): string => {
  if (!category) return 'Miscellaneous';
  
  const EXPENSE_CATEGORIES = getCategoryNames();
  
  // Check legacy mapping first
  if (LEGACY_CATEGORY_MAP[category]) {
    return LEGACY_CATEGORY_MAP[category];
  }
  
  // Check for exact match
  const exactMatch = EXPENSE_CATEGORIES.find(
    c => c.toLowerCase() === category.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Look for partial matches or keywords
  const lowerCategory = category.toLowerCase();
  
  // Keyword-based matching
  if (lowerCategory.includes('food') || lowerCategory.includes('dining') || 
      lowerCategory.includes('restaurant') || lowerCategory.includes('coffee')) {
    return 'Food & Dining';
  }
  if (lowerCategory.includes('grocer') || lowerCategory.includes('supermarket')) {
    return 'Groceries';
  }
  if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage') || 
      lowerCategory.includes('house') || lowerCategory.includes('housing')) {
    return 'Housing';
  }
  if (lowerCategory.includes('electric') || lowerCategory.includes('water') || 
      lowerCategory.includes('gas') || lowerCategory.includes('internet') ||
      lowerCategory.includes('utility') || lowerCategory.includes('bill')) {
    return 'Utilities & Bills';
  }
  if (lowerCategory.includes('transport') || lowerCategory.includes('fuel') || 
      lowerCategory.includes('gas') || lowerCategory.includes('taxi') ||
      lowerCategory.includes('uber') || lowerCategory.includes('car')) {
    return 'Transportation';
  }
  if (lowerCategory.includes('health') || lowerCategory.includes('medical') || 
      lowerCategory.includes('doctor') || lowerCategory.includes('gym') ||
      lowerCategory.includes('fitness')) {
    return 'Health & Fitness';
  }
  if (lowerCategory.includes('education') || lowerCategory.includes('school') || 
      lowerCategory.includes('tuition') || lowerCategory.includes('course')) {
    return 'Education';
  }
  if (lowerCategory.includes('subscription') || lowerCategory.includes('streaming') ||
      lowerCategory.includes('netflix') || lowerCategory.includes('spotify')) {
    return 'Subscriptions';
  }
  if (lowerCategory.includes('entertainment') || lowerCategory.includes('movie') ||
      lowerCategory.includes('game') || lowerCategory.includes('event')) {
    return 'Entertainment';
  }
  if (lowerCategory.includes('travel') || lowerCategory.includes('flight') ||
      lowerCategory.includes('hotel') || lowerCategory.includes('vacation')) {
    return 'Travel';
  }
  if (lowerCategory.includes('gift') || lowerCategory.includes('donation') ||
      lowerCategory.includes('charity')) {
    return 'Donations & Gifts';
  }
  if (lowerCategory.includes('saving') || lowerCategory.includes('invest')) {
    return 'Savings & Investments';
  }
  
  // Look for partial matches in category names
  const partialMatches = EXPENSE_CATEGORIES.filter(
    c => c.toLowerCase().includes(lowerCategory) || 
         lowerCategory.includes(c.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    return partialMatches[0];
  }
  
  // No match found, use Miscellaneous as fallback
  return 'Miscellaneous';
};
