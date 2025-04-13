
import { format, parseISO } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

// Re-export formatCurrency so existing components don't break
export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Define category colors with improved contrast
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#2E7D32", // Darker green
  "Groceries": "#558B2F", 
  "Housing": "#512DA8", // Darker purple
  "Utilities": "#EF6C00", // Darker orange
  "Transportation": "#1565C0", // Darker blue
  "Healthcare": "#D32F2F", // Darker red
  "Entertainment": "#C2185B", // Darker pink
  "Shopping": "#E65100", // Darker orange
  "Personal": "#303F9F", // Darker indigo
  "Education": "#0097A7", // Darker teal
  "Travel": "#455A64", // Darker blue-grey
  "Insurance": "#5D4037", // Darker brown
  "Debt": "#7B1FA2", // Darker purple
  "Savings": "#00796B", // Darker teal
  "Other": "#616161", // Darker grey
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
