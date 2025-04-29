import { format } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

// Enhanced color palette with more distinct colors
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#FF9F7A",         // Vibrant Peach
  "Groceries": "#4ADE80",    // Vivid Green  
  "Utilities": "#A17FFF",    // Bright Purple
  "Housing": "#7AB2F5",      // Vivid Blue
  "Transportation": "#F87DB5", // Bright Pink
  "Entertainment": "#FACC15", // Vivid Yellow
  "Shopping": "#FF7A92",     // Bright Rose
  "Personal": "#9E75FF",     // Bright Purple
  "Education": "#38BDF8",    // Bright Blue
  "Travel": "#66CDAA",       // Medium Aquamarine
  "Insurance": "#F472B6",    // Bright Pink
  "Debt": "#C084FC",         // Bright Purple
  "Savings": "#A3E635",      // Bright Lime
  "Healthcare": "#60A5FA",   // Blue
  "General": "#FF8042",      // Orange
  "Other": "#94A3B8",        // Bright Gray
};

export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Process monthly data for charts with optimization for mobile
export const processMonthlyData = (expenses: Expense[]) => {
  // Group expenses by month
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = format(new Date(expense.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {};
      Object.keys(CATEGORY_COLORS).forEach(category => {
        acc[month][category] = 0;
      });
    }
    acc[month][expense.category] = (acc[month][expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, Record<string, number>>);

  // Convert to array format for charts
  return Object.entries(monthlyData)
    .sort(([monthA], [monthB]) => {
      const dateA = new Date(monthA);
      const dateB = new Date(monthB);
      return dateA.getTime() - dateB.getTime();
    })
    .map(([month, categories]) => ({
      month,
      ...categories
    }));
};

// Enhanced pie chart data calculation with better optimization
export const calculatePieChartData = (expenses: Expense[]) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  // Sort by value and limit to top categories for cleaner display
  return Object.entries(categoryTotals)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 8) // Show top 8 categories for better visibility
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || "#94A3B8",
      percent: total > 0 ? (value / total) * 100 : 0,
    }));
};
