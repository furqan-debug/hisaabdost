
import React from 'react';

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export const extractChartData = (
  formattedContent: string, 
  visualData?: any
): ChartDataItem[] => {
  // If visualData contains actual transactions array with values, use it directly
  if (visualData?.transactions && Array.isArray(visualData.transactions) && visualData.transactions.length > 0) {
    return visualData.transactions
      .filter((transaction: any) => transaction.amount && Number(transaction.amount) > 0)
      .map((transaction: any) => ({
        name: transaction.description || transaction.category || 'Unknown',
        value: Number(transaction.amount),
        color: transaction.color || getRandomColor(transaction.category)
      }))
      .slice(0, 5); // Limit to top 5 for clarity
  }
  
  // Extract spending amounts from message content using more robust patterns
  // Check for currency patterns like $100, 100 dollars, etc.
  const amountPatterns = [
    // Format: Category: $100
    { regex: /([A-Za-z\s]+):\s*\$?(\d+[\.,]?\d*)/g, categoryIndex: 1, valueIndex: 2 },
    // Format: $100 for Category
    { regex: /\$(\d+[\.,]?\d*) (?:for|on) ([A-Za-z\s]+)/g, categoryIndex: 2, valueIndex: 1 },
    // Format: spent $100 on Category
    { regex: /spent \$?(\d+[\.,]?\d*) (?:for|on) ([A-Za-z\s]+)/g, categoryIndex: 2, valueIndex: 1 },
  ];
  
  // Temporary storage for extracted data
  const extractedData: Record<string, number> = {};
  
  // Try each pattern
  amountPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(formattedContent)) !== null) {
      const category = match[pattern.categoryIndex].trim();
      const amount = parseFloat(match[pattern.valueIndex].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        extractedData[category] = (extractedData[category] || 0) + amount;
      }
    }
  });
  
  // If nothing was extracted, try standard categories with fallback values
  if (Object.keys(extractedData).length === 0) {
    const standardCategories = [
      { name: 'Food', pattern: /food|grocery|groceries|restaurant|dining|eat|meal/i, color: '#FF9F7A' },
      { name: 'Utilities', pattern: /utilities|water|electricity|gas|bill|internet|power/i, color: '#A17FFF' },
      { name: 'Entertainment', pattern: /entertainment|movie|game|fun|hobby|leisure/i, color: '#FACC15' },
      { name: 'Housing', pattern: /housing|rent|mortgage|home|apartment|lease/i, color: '#4ADE80' },
      { name: 'Transportation', pattern: /transport|car|bus|train|gas|fuel|ride|travel/i, color: '#F87DB5' },
      { name: 'Shopping', pattern: /shop|purchase|buy|bought|amazon|retail|clothes|items/i, color: '#FF7A92' }
    ];
    
    standardCategories.forEach(category => {
      if (category.pattern.test(formattedContent)) {
        // Generate a pseudo-random value based on the category name for demo purposes
        // This ensures visualization has data when message mentions categories but no specific amounts
        const seed = category.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        extractedData[category.name] = (100 + (seed % 900));
      }
    });
  }
  
  // If custom data is provided in visualData
  if (visualData?.type === 'category' && visualData?.category) {
    const categoryName = visualData.category;
    const monthlyData = [];
    
    // Create monthly trend data for this category
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Generate the last 4 months of data
    for (let i = 3; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Ensure we wrap around properly
      
      // Generate some sample values for the trend
      // If visualData has a total, distribute it across months, otherwise use random values
      const baseValue = visualData.total 
        ? visualData.total / (i+1) * (Math.random() * 0.5 + 0.75) 
        : (Math.random() * 100 + 50) * (4 - i); // Make more recent months have larger values
      
      monthlyData.push({
        name: months[monthIndex],
        value: Math.round(baseValue * 100) / 100, 
        color: getColorForIndex(i)
      });
    }
    
    if (monthlyData.length > 0) {
      return monthlyData;
    }
  }
  
  // Convert extracted data to chart format
  const data = Object.entries(extractedData)
    .filter(([_, value]) => value > 0) // Filter out zero values
    .map(([name, value], index) => ({
      name,
      value,
      color: getColorForCategory(name) || getColorForIndex(index)
    }));
  
  // Ensure we have at least some data for visualization
  if (data.length === 0 && formattedContent.toLowerCase().includes('spending')) {
    // Provide fallback demo data if message mentions spending but no specific values
    return [
      { name: 'Food', value: 350, color: '#FF9F7A' },
      { name: 'Utilities', value: 200, color: '#A17FFF' },
      { name: 'Entertainment', value: 150, color: '#FACC15' },
      { name: 'Housing', value: 800, color: '#4ADE80' },
      { name: 'Transportation', value: 120, color: '#F87DB5' }
    ];
  }
  
  return data;
};

// Helper functions for colors
const getColorForCategory = (category: string): string => {
  const colors: Record<string, string> = {
    'Food': '#FF9F7A',
    'Groceries': '#FF9F7A',
    'Utilities': '#A17FFF',
    'Housing': '#4ADE80',
    'Rent': '#4ADE80',
    'Transportation': '#F87DB5',
    'Entertainment': '#FACC15',
    'Shopping': '#FF7A92',
    'Other': '#94A3B8'
  };
  
  for (const [key, color] of Object.entries(colors)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  return '#94A3B8'; // Default color
};

const getColorForIndex = (index: number): string => {
  const colors = ['#4ADE80', '#A17FFF', '#FACC15', '#F87DB5', '#FF9F7A', '#FF7A92'];
  return colors[index % colors.length];
};

const getRandomColor = (seed?: string): string => {
  const colors = ['#4ADE80', '#A17FFF', '#FACC15', '#F87DB5', '#FF9F7A', '#FF7A92', '#94A3B8'];
  if (seed) {
    const seedValue = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[seedValue % colors.length];
  }
  return colors[Math.floor(Math.random() * colors.length)];
};
