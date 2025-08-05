
export const CATEGORY_COLORS = {
  "Food": "#FF6B6B",
  "Rent": "#4ECDC4", 
  "Utilities": "#45B7D1",
  "Transportation": "#96CEB4",
  "Entertainment": "#FFEAA7",
  "Shopping": "#DDA0DD",
  "Healthcare": "#98D8C8",
  "Other": "#F7DC6F"
} as const;

export type CategoryType = keyof typeof CATEGORY_COLORS;

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category as CategoryType] || CATEGORY_COLORS["Other"];
};

// Process expenses data for monthly charts (bar and line charts)
export const processMonthlyData = (expenses: any[], allCategories?: string[]) => {
  const monthlyData: Record<string, any> = {};
  
  // Get unique categories from expenses if allCategories not provided
  const uniqueCategories = allCategories || [...new Set(expenses.map(expense => expense.category || 'Other'))];
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey };
      // Initialize all categories to 0
      uniqueCategories.forEach(category => {
        monthlyData[monthKey][category] = 0;
      });
    }
    
    const category = expense.category || 'Other';
    monthlyData[monthKey][category] += Number(expense.amount) || 0;
  });
  
  return Object.values(monthlyData).sort((a: any, b: any) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });
};

// Calculate pie chart data from expenses
export const calculatePieChartData = (expenses: any[]) => {
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const category = expense.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
  });
  
  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  return Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category),
      percent: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
};

// Format currency utility function
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  try {
    // Check if amount is a whole number
    const isWholeNumber = amount === Math.floor(amount);
    
    // Special handling for INR to support lakhs and crores notation
    if (currencyCode === 'INR') {
      if (amount >= 10000000) { // 1 crore = 10,000,000
        return `₹${(amount / 10000000).toFixed(isWholeNumber ? 0 : 2)} crore`;
      } else if (amount >= 100000) { // 1 lakh = 100,000
        return `₹${(amount / 100000).toFixed(isWholeNumber ? 0 : 2)} lakh`;
      }
    }
    
    // Special handling for PKR
    if (currencyCode === 'PKR') {
      return `Rs ${isWholeNumber ? amount.toFixed(0) : amount.toFixed(2)}`;
    }
    
    // Default currency formatting using Intl
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    // Fallback to USD if there's any error
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount === Math.floor(amount) ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
};
