import { format } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

// Light and minimalist color palette with distinct colors
export const CATEGORY_COLORS: Record<string, string> = {
  "Healthcare": "#F2FCE2",      // Soft Green
  "Groceries": "#FEF7CD",       // Soft Yellow
  "Utilities": "#D3E4FD",       // Soft Blue
  "Housing": "#FEC6A1",         // Soft Orange
  "Transportation": "#E5DEFF",  // Soft Purple
  "Entertainment": "#FFDEE2",   // Soft Pink
  "Shopping": "#FDE1D3",        // Soft Peach
  "Personal": "#F1F0FB",        // Soft Gray
  "Education": "#8B5CF6",       // Vivid Purple (for accent)
  "Travel": "#0EA5E9",          // Ocean Blue (for accent)
  "Insurance": "#D946EF",       // Magenta Pink (for accent)
  "Debt": "#F97316",            // Bright Orange (for accent)
  "Savings": "#98FB98",         // Pale Green
  "Other": "#D3D3D3",           // Light Gray
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
    .slice(0, 6) // Limit to top 6 categories for cleaner display
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || "#CFD8DC",
      percent: total > 0 ? (value / total) * 100 : 0,
    }));
};
