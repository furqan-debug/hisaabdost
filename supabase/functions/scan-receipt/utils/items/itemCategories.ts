
// Enhanced categorization for Pakistani items
export function guessCategoryFromItemName(itemName: string): string {
  const name = itemName.toLowerCase();
  
  // Food & Beverages
  if (name.includes('yogurt') || name.includes('yoghurt') || 
      name.includes('milk') || name.includes('cheese') || 
      name.includes('butter') || name.includes('cream')) {
    return 'Food';
  }
  
  if (name.includes('chicken') || name.includes('beef') || 
      name.includes('mutton') || name.includes('fish') || 
      name.includes('meat') || name.includes('wrap') || 
      name.includes('burger') || name.includes('sandwich')) {
    return 'Food';
  }
  
  if (name.includes('water') || name.includes('juice') || 
      name.includes('drink') || name.includes('tea') || 
      name.includes('coffee') || name.includes('cola') || 
      name.includes('pepsi') || name.includes('sprite')) {
    return 'Food';
  }
  
  if (name.includes('rice') || name.includes('wheat') || 
      name.includes('flour') || name.includes('bread') || 
      name.includes('biscuit') || name.includes('cookie')) {
    return 'Food';
  }
  
  // Personal Care
  if (name.includes('toothpaste') || name.includes('brush') || 
      name.includes('soap') || name.includes('shampoo') || 
      name.includes('handwash') || name.includes('sanitizer') || 
      name.includes('lotion') || name.includes('cream') ||
      name.includes('dettol') || name.includes('colgate')) {
    return 'Health';
  }
  
  // Clothing
  if (name.includes('shirt') || name.includes('pant') || 
      name.includes('trouser') || name.includes('dress') || 
      name.includes('jacket') || name.includes('coat') ||
      name.includes('cotton') || name.includes('fabric')) {
    return 'Shopping';
  }
  
  // Electronics & Accessories
  if (name.includes('cable') || name.includes('charger') || 
      name.includes('phone') || name.includes('usb') || 
      name.includes('adapter') || name.includes('battery') ||
      name.includes('electronic') || name.includes('wire')) {
    return 'Shopping';
  }
  
  // Pakistani specific items
  if (name.includes('tandoori') || name.includes('biryani') || 
      name.includes('karahi') || name.includes('halal') ||
      name.includes('desi') || name.includes('masala')) {
    return 'Food';
  }
  
  // Household items
  if (name.includes('detergent') || name.includes('cleaner') || 
      name.includes('tissue') || name.includes('paper') ||
      name.includes('bag') || name.includes('bottle')) {
    return 'Shopping';
  }
  
  // Transportation
  if (name.includes('fuel') || name.includes('petrol') || 
      name.includes('diesel') || name.includes('gas') ||
      name.includes('transport') || name.includes('fare')) {
    return 'Transport';
  }
  
  // Default to Shopping for retail items
  return 'Shopping';
}
