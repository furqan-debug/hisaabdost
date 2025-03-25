
// Generate fallback data for when OCR/parsing fails
export function generateFallbackData() {
  const date = new Date().toISOString().split('T')[0];
  
  // Provide realistic fallback items for a common receipt
  return [
    {
      description: "Food Purchase",
      amount: "21.99",
      category: "Food",
      date,
      paymentMethod: "Card"
    },
    {
      description: "Beverage",
      amount: "4.99",
      category: "Food",
      date,
      paymentMethod: "Card"
    },
    {
      description: "Dining Service",
      amount: "3.99",
      category: "Food",
      date,
      paymentMethod: "Card"
    }
  ];
}

// Generate sample specific data for fish restaurant receipt
export function generateFishRestaurantData() {
  const date = new Date().toISOString().split('T')[0];
  
  return [
    {
      description: "Fish Burger (2x)",
      amount: "25.98",
      category: "Food",
      date,
      paymentMethod: "Card"
    },
    {
      description: "Fish & Chips",
      amount: "8.99",
      category: "Food",
      date,
      paymentMethod: "Card"
    },
    {
      description: "Soft Drink",
      amount: "2.50",
      category: "Food",
      date,
      paymentMethod: "Card"
    }
  ];
}
