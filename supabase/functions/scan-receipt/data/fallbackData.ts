
// Generate fallback data for testing or when OCR fails
export function generateFallbackData() {
  return [
    { 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
      name: "Milk", 
      category: "Groceries", 
      amount: "$3.99" 
    },
    { 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
      name: "Bread", 
      category: "Groceries", 
      amount: "$2.49" 
    },
    { 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
      name: "Eggs", 
      category: "Groceries", 
      amount: "$4.99" 
    }
  ]
}
