
import { format, parseISO } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

// Re-export formatCurrency so existing components don't break
export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Define category colors with a clean, minimalist palette with good contrast
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#3B82F6", // Blue
  "Groceries": "#10B981", // Emerald
  "Housing": "#6366F1", // Indigo
  "Utilities": "#8B5CF6", // Violet
  "Transportation": "#EC4899", // Pink
  "Healthcare": "#F43F5E", // Rose
  "Entertainment": "#F59E0B", // Amber
  "Shopping": "#EF4444", // Red
  "Personal": "#64748B", // Slate
  "Education": "#0EA5E9", // Sky
  "Travel": "#14B8A6", // Teal
  "Insurance": "#A855F7", // Purple
  "Debt": "#F97316", // Orange
  "Savings": "#06B6D4", // Cyan
  "Other": "#94A3B8", // Gray
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

// Calculate data for pie charts
export const calculatePieChartData = (expenses: Expense[]) => {
  // Group by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  // Calculate total for percentages
  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  // Convert to array format for pie chart
  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || "#9E9E9E",
    percent: total > 0 ? value / total : 0, // Add percent property
  }));
};
