
// Format price to match required output
export function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

// Capitalize the first letter of a string
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Guess category based on item name
export function guessCategory(itemName: string) {
  const lowerName = itemName.toLowerCase()
  
  // Food categories
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
    return "Groceries"
  }
  
  // Household items
  if (lowerName.includes('paper') ||
      lowerName.includes('cleaner') ||
      lowerName.includes('soap') ||
      lowerName.includes('detergent') ||
      lowerName.includes('tissue') ||
      lowerName.includes('toilet')) {
    return "Household"
  }
  
  // Default category
  return "Shopping"
}
