
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
  // Default data if no visualization data is provided or for spending-chart
  if (!visualData || visualData.type === 'spending-chart') {
    // Extract spending amounts from message content
    const foodMatch = formattedContent.match(/Food:?\s*\$?(\d+\.?\d*)/i);
    const utilitiesMatch = formattedContent.match(/Utilities:?\s*\$?(\d+\.?\d*)/i);
    const entertainmentMatch = formattedContent.match(/Entertainment:?\s*\$?(\d+\.?\d*)/i);
    const housingMatch = formattedContent.match(/Housing:?\s*\$?(\d+\.?\d*)/i);
    const transportationMatch = formattedContent.match(/Transportation:?\s*\$?(\d+\.?\d*)/i);
    const shoppingMatch = formattedContent.match(/Shopping:?\s*\$?(\d+\.?\d*)/i);
    
    const data = [
      { name: 'Food', value: foodMatch ? parseFloat(foodMatch[1]) : 0, color: '#FF9F7A' },
      { name: 'Utilities', value: utilitiesMatch ? parseFloat(utilitiesMatch[1]) : 0, color: '#A17FFF' },
      { name: 'Entertainment', value: entertainmentMatch ? parseFloat(entertainmentMatch[1]) : 0, color: '#FACC15' },
      { name: 'Housing', value: housingMatch ? parseFloat(housingMatch[1]) : 0, color: '#4ADE80' },
      { name: 'Transportation', value: transportationMatch ? parseFloat(transportationMatch[1]) : 0, color: '#F87DB5' },
      { name: 'Shopping', value: shoppingMatch ? parseFloat(shoppingMatch[1]) : 0, color: '#FF7A92' }
    ];
    
    // Filter out categories with zero value
    return data.filter(item => item.value > 0);
  }
  
  // Use provided visual data if available
  if (visualData && visualData.transactions && Array.isArray(visualData.transactions)) {
    return visualData.transactions.map((transaction: any) => ({
      name: transaction.description || transaction.category,
      value: transaction.amount,
      color: '#94A3B8'
    })).slice(0, 5); // Limit to top 5 for clarity
  }
  
  // If we have category data
  if (visualData && visualData.type === 'category' && visualData.category) {
    const categoryName = visualData.category;
    const monthlyData = [];
    
    // Create monthly trend data for this category
    const currentDate = new Date();
    for (let i = 3; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Generate some sample values for the trend
      const baseValue = visualData.total ? visualData.total / (i+1) * (Math.random() * 0.5 + 0.75) : (Math.random() * 100 + 50);
      
      monthlyData.push({
        name: monthName,
        value: Math.round(baseValue * 100) / 100, 
        color: '#94A3B8'
      });
    }
    
    return monthlyData;
  }
  
  // Default empty data
  return [];
};
