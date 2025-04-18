
import { format, parseISO } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Updated modern color palette with better contrast 
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#4287f5",         // Bright Blue
  "Groceries": "#22c55e",    // Bright Green
  "Housing": "#9046cf",      // Purple
  "Utilities": "#64748b",    // Slate
  "Transportation": "#ef4444", // Red
  "Healthcare": "#d946ef",    // Pink
  "Entertainment": "#f59e0b", // Amber
  "Shopping": "#6366f1",     // Indigo
  "Personal": "#8b5cf6",     // Violet
  "Education": "#0ea5e9",    // Sky
  "Travel": "#14b8a6",       // Teal
  "Insurance": "#8b5cf6",    // Violet
  "Debt": "#f97316",         // Orange
  "Savings": "#22c55e",      // Green
  "Other": "#94a3b8",        // Cool Gray
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
    .slice(0, 5) // Limit to top 5 categories for cleaner display
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || "#94A3B8",
      percent: total > 0 ? (value / total) * 100 : 0,
    }));
};
