import { format } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

// Updated vibrant and minimalist color palette
export const CATEGORY_COLORS: Record<string, string> = {
  "Healthcare": "#FF6B8E",      // Soft Vibrant Pink
  "Groceries": "#FFD700",        // Soft Vibrant Gold
  "Utilities": "#5CC7F2",        // Soft Vibrant Blue
  "Housing": "#B7E5B4",          // Soft Green
  "Transportation": "#9370DB",   // Soft Purple
  "Entertainment": "#FFA07A",    // Soft Coral
  "Shopping": "#87CEFA",         // Light Sky Blue
  "Personal": "#DDA0DD",         // Soft Plum
  "Education": "#32CD32",        // Lime Green
  "Travel": "#40E0D0",           // Turquoise
  "Insurance": "#F0E68C",        // Khaki
  "Debt": "#FF6347",             // Tomato
  "Savings": "#98FB98",          // Pale Green
  "Other": "#D3D3D3",            // Light Gray
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
