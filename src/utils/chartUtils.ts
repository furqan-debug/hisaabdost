
import { format, parseISO } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

// Re-export formatCurrency so existing components don't break
export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Define category colors
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#4CAF50",
  "Groceries": "#8BC34A", 
  "Housing": "#673AB7",
  "Utilities": "#FFC107",
  "Transportation": "#2196F3",
  "Healthcare": "#F44336",
  "Entertainment": "#FF4081",
  "Shopping": "#FF9800",
  "Personal": "#3F51B5",
  "Education": "#00BCD4",
  "Travel": "#607D8B",
  "Insurance": "#795548",
  "Debt": "#9C27B0",
  "Savings": "#009688",
  "Other": "#9E9E9E",
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

  // Convert to array format for pie chart
  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || "#9E9E9E",
  }));
};

