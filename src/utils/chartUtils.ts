import { format } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrencyWithSymbol } from "@/utils/formatters";

export const CATEGORY_COLORS = {
  'Food': '#0088FE',
  'Rent': '#00C49F',
  'Utilities': '#FFBB28',
  'Transportation': '#FF8042',
  'Entertainment': '#8884D8',
  'Shopping': '#82CA9D',
  'Healthcare': '#FF6B6B',
  'Education': '#6A7FDB',
  'Travel': '#FF9D5C',
  'Groceries': '#4BC0C0',
  'Restaurants': '#9966FF',
  'Clothing': '#FF99CC',
  'Bills': '#FF6B6B',
  'Other': '#A4DE6C'
} as const;

export function formatCurrencyWithCurrentSymbol(amount: number, symbol: string): string {
  return formatCurrencyWithSymbol(amount, symbol);
}

export function formatCurrency(amount: number, symbol = "$"): string {
  return formatCurrencyWithSymbol(amount, symbol);
}

// Helper to get all months between two dates
const getMonthsBetween = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    months.push(format(currentDate, 'MMM yyyy'));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
};

export const processMonthlyData = (expenses: Expense[]) => {
  if (expenses.length === 0) return [];

  // Get date range
  const dates = expenses.map(e => new Date(e.date));
  const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Get all months in range
  const allMonths = getMonthsBetween(startDate, endDate);

  // Group expenses by category and month
  const expensesByCategory = Object.keys(CATEGORY_COLORS).reduce((acc, category) => {
    const categoryExpenses = expenses.filter(e => e.category === category);
    
    // For each month, sum the expenses for this category
    const monthlyData = allMonths.map(month => {
      const monthExpenses = categoryExpenses.filter(
        e => format(new Date(e.date), 'MMM yyyy') === month
      );
      
      // If there are expenses this month, sum them. Otherwise, return null
      const total = monthExpenses.length > 0
        ? monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        : null;
      
      return {
        month,
        [category]: total
      };
    });
    
    acc[category] = monthlyData;
    return acc;
  }, {} as Record<string, Array<{ month: string; [key: string]: string | number | null }>>);

  // Merge all categories into a single array of data points
  return allMonths.map(month => {
    const monthData = { month };
    Object.keys(CATEGORY_COLORS).forEach(category => {
      const categoryData = expensesByCategory[category].find(d => d.month === month);
      monthData[category] = categoryData ? categoryData[category] : null;
    });
    return monthData;
  });
};

export const calculatePieChartData = (expenses: Expense[]) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#A4DE6C',
    percent: 0 // Will be calculated later when needed
  }));
};
