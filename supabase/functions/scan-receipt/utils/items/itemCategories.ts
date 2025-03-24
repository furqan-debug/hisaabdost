
// Guess category based on item name
export function guessCategoryFromItemName(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Food and grocery categories
  if (lowerName.includes('milk') || 
      lowerName.includes('egg') || 
      lowerName.includes('bread') ||
      lowerName.includes('cheese') ||
      lowerName.includes('yogurt') ||
      lowerName.includes('fruit') ||
      lowerName.includes('vegetable') ||
      lowerName.includes('meat') ||
      lowerName.includes('chicken') ||
      lowerName.includes('fish') ||
      lowerName.includes('cereal')) {
    return "Groceries";
  }
  
  // Household items
  if (lowerName.includes('paper') ||
      lowerName.includes('cleaner') ||
      lowerName.includes('soap') ||
      lowerName.includes('detergent') ||
      lowerName.includes('tissue') ||
      lowerName.includes('toilet')) {
    return "Household";
  }
  
  // Electronics
  if (lowerName.includes('phone') ||
      lowerName.includes('cable') ||
      lowerName.includes('charger') ||
      lowerName.includes('battery') ||
      lowerName.includes('headphone') ||
      lowerName.includes('speaker')) {
    return "Electronics";
  }
  
  // Clothing
  if (lowerName.includes('shirt') ||
      lowerName.includes('pant') ||
      lowerName.includes('sock') ||
      lowerName.includes('shoe') ||
      lowerName.includes('jacket') ||
      lowerName.includes('dress')) {
    return "Clothing";
  }
  
  // Default category
  return "Shopping";
}
