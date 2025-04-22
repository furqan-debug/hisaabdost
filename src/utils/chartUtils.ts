
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency } from "./formatters";

// Format currency - now referenced from formatters.ts
export { formatCurrency };

// Category colors for consistent visualization
export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#4f46e5", // Indigo
  Transportation: "#0ea5e9", // Sky blue
  Food: "#10b981", // Emerald
  Utilities: "#f59e0b", // Amber
  Entertainment: "#ec4899", // Pink
  Healthcare: "#ef4444", // Red
  Insurance: "#8b5cf6", // Violet
  Debt: "#f43f5e", // Rose
  Savings: "#6366f1", // Indigo
  Shopping: "#a855f7", // Purple
  Education: "#14b8a6", // Teal
  Personal: "#0d9488", // Teal darker
  Travel: "#0284c7", // Sky darker
  Gifts: "#d946ef", // Fuchsia
  Investments: "#059669", // Emerald darker
  Business: "#7c3aed", // Violet darker
  "Dining Out": "#ea580c", // Orange
  Subscriptions: "#84cc16", // Lime
  Miscellaneous: "#94a3b8", // Slate
};

// For pie charts
export function calculatePieChartData(expenses: Expense[]) {
  // Group by category and calculate totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate total amount for percentages
  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  // Format data for pie chart
  return Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#94A3B8',
      percent: totalAmount > 0 ? (value / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
}

// For line and bar charts
export function processMonthlyData(expenses: Expense[]) {
  if (!expenses.length) return [];
  
  // Find date range from expenses
  const dates = expenses.map(e => new Date(e.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Generate array of months from earliest to latest expense
  const monthRange = eachMonthOfInterval({
    start: startOfMonth(minDate),
    end: endOfMonth(maxDate)
  });
  
  // Initialize result with all months in range
  const result = monthRange.map(month => ({
    month: format(month, 'MMM yyyy'),
    date: month,
    ...Object.keys(CATEGORY_COLORS).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<string, number>)
  }));
  
  // Fill in expense data
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const monthKey = format(expenseDate, 'MMM yyyy');
    const monthData = result.find(item => item.month === monthKey);
    
    if (monthData) {
      const category = expense.category;
      monthData[category] = (monthData[category] || 0) + Number(expense.amount);
    }
  });
  
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}
