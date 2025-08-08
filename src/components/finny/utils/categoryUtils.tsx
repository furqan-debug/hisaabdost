
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';

export const validateCategory = (category: string): string => {
  if (!category) return 'Other';
  
  // Check for exact match with official categories
  const exactMatch = EXPENSE_CATEGORIES.find(
    c => c.toLowerCase() === category.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Handle legacy category mappings to official categories
  const categoryMappings: Record<string, string> = {
    'food & dining': 'Food',
    'food and dining': 'Food',
    'bills & utilities': 'Utilities', 
    'bills and utilities': 'Utilities',
    'transport': 'Transportation',
    'medical': 'Healthcare',
    'health': 'Healthcare'
  };
  
  const lowerCategory = category.toLowerCase();
  if (categoryMappings[lowerCategory]) {
    return categoryMappings[lowerCategory];
  }
  
  // Look for partial matches with official categories
  const partialMatches = EXPENSE_CATEGORIES.filter(
    c => c.toLowerCase().includes(lowerCategory) || 
         lowerCategory.includes(c.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    return partialMatches[0]; // Return the first partial match
  }
  
  // No match found, use Other as fallback
  return 'Other';
};
