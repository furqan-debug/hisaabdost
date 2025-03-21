
// Guess the category based on the item name
export function guessCategoryFromItemName(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Gas and transportation
  if (lowerName.includes('gas') ||
      lowerName.includes('fuel') ||
      lowerName.includes('diesel') ||
      lowerName.includes('unleaded') ||
      lowerName.includes('premium') ||
      lowerName.includes('litre') ||
      lowerName.includes('gallon')) {
    return "Transportation";
  }
  
  // Food items
  if (lowerName.includes('milk') || 
      lowerName.includes('egg') || 
      lowerName.includes('cheese') ||
      lowerName.includes('yogurt') ||
      lowerName.includes('bread') ||
      lowerName.includes('fruit') ||
      lowerName.includes('vegetable') ||
      lowerName.includes('meat') ||
      lowerName.includes('chicken') ||
      lowerName.includes('fish') ||
      lowerName.includes('tuna') ||
      lowerName.includes('banana') ||
      lowerName.includes('tomato')) {
    return "Groceries";
  }
  
  // Household items
  if (lowerName.includes('paper') || 
      lowerName.includes('wipe') || 
      lowerName.includes('clean') ||
      lowerName.includes('detergent') ||
      lowerName.includes('soap') ||
      lowerName.includes('toilet') ||
      lowerName.includes('baby')) {
    return "Household";
  }
  
  // Default to Shopping
  return "Shopping";
}
