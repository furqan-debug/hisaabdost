
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';

export const validateCategory = (category: string): string => {
  if (!category) return 'Other';
  
  // Check for exact match
  const exactMatch = EXPENSE_CATEGORIES.find(
    c => c.toLowerCase() === category.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Look for partial matches
  const partialMatches = EXPENSE_CATEGORIES.filter(
    c => c.toLowerCase().includes(category.toLowerCase()) || 
         category.toLowerCase().includes(c.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    return partialMatches[0]; // Return the first partial match
  }
  
  // No match found, use Other as fallback
  return 'Other';
};
