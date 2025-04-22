import { format } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import { CurrencyCode } from "./currencyUtils";

export const formatCurrency = (amount: number, currencyCode?: CurrencyCode) => {
  return formatCurrencyUtil(amount, currencyCode);
};

// Modern soft pastel color palette (cleaner look)
export const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#A7D8FF",
  "Groceries": "#BEE7A5",
  "Housing": "#CDB4EF",
  "Utilities": "#CED8DF",
  "Transportation": "#FFB8B2",
  "Healthcare": "#FFB2D8",
  "Entertainment": "#FFE3A7",
  "Shopping": "#BFCAFB",
  "Personal": "#D3C6F3",
  "Education": "#A6E8FD",
  "Travel": "#B2F0EC",
  "Insurance": "#D3C6F3",
  "Debt": "#FFD7AA",
  "Savings": "#BEE7A5",
  "Other": "#E4EDF2",
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
