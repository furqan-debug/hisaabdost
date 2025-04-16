import { format, parseISO } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Updated color palette with better contrast ratios
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#3B82F6",          // Bright Blue
  "Groceries": "#22C55E",     // Green
  "Housing": "#8B5CF6",       // Purple
  "Utilities": "#475569",     // Slate
  "Transportation": "#EF4444", // Red
  "Healthcare": "#EC4899",    // Pink
  "Entertainment": "#F59E0B",  // Amber
  "Shopping": "#6366F1",      // Indigo
  "Personal": "#9333EA",      // Violet
  "Education": "#0EA5E9",     // Sky
  "Travel": "#14B8A6",        // Teal
  "Insurance": "#4F46E5",     // Indigo
  "Debt": "#F97316",         // Orange
  "Savings": "#16A34A",      // Green
  "Other": "#64748B",        // Cool Gray
};

// Process monthly data for charts
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

// Enhanced pie chart data calculation
export const calculatePieChartData = (expenses: Expense[]) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  return Object.entries(categoryTotals)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || "#94A3B8",
      percent: total > 0 ? (value / total) * 100 : 0,
    }));
};
