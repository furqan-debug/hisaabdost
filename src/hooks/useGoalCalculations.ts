
import { formatCurrency } from "@/utils/formatters";
import { CurrencyCode } from "@/utils/currencyUtils";
import { startOfMonth, endOfMonth, isSameMonth } from "date-fns";

interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category: string;
  deadline: string;
  created_at: string;
}

export function useGoalCalculations(expenses: any[], budgets: any[], currencyCode: string) {
  // Calculate category savings since goal creation
  const calculateCategorySavings = (goal: Goal) => {
    if (!expenses || !budgets) return 0;

    // Get budget for this category
    const categoryBudget = budgets.find(b => b.category === goal.category);
    if (!categoryBudget) return 0; // No budget for this category

    // Get current month's start and end
    const now = new Date();

    // Get expenses for this category in the current month
    const currentMonthExpenses = expenses.filter(e => 
      e.category === goal.category && isSameMonth(new Date(e.date), now)
    );

    // Calculate total expenses for this category in the current month
    const totalExpenses = currentMonthExpenses.reduce((sum, exp) => 
      sum + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount), 0
    );

    // Calculate monthly budget
    const monthlyBudget = categoryBudget.amount;

    // Calculate savings = Budget - Expenses (can be negative if overspent)
    const savings = monthlyBudget - totalExpenses;

    // Return savings (which can be negative if overspent)
    return savings;
  };

  const calculateProgress = (goal: Goal) => {
    // Get savings for this category
    const savings = calculateCategorySavings(goal);

    // If savings is negative (overspent), return 0% progress
    if (savings <= 0) return 0;

    // Calculate progress as (savings / target_amount) * 100
    const target = typeof goal.target_amount === 'string' ? parseFloat(goal.target_amount) : goal.target_amount;
    if (target === 0) return 0; // Avoid division by zero

    // Cap progress at 100%
    return Math.min((savings / target) * 100, 100);
  };

  const generateTip = (goal: Goal) => {
    const savings = calculateCategorySavings(goal);
    const progress = calculateProgress(goal);
    const categoryBudget = budgets?.find(b => b.category === goal.category);
    const monthlyBudget = categoryBudget ? categoryBudget.amount : 0;

    // Handle case where there's no budget set for this category
    if (!categoryBudget || monthlyBudget === 0) {
      return "Set a monthly budget for this category to start tracking your savings progress.";
    }

    // If savings are negative (overspent)
    if (savings < 0) {
      return `You've overspent your ${goal.category} budget by ${formatCurrency(Math.abs(savings), currencyCode as CurrencyCode)}. Try to reduce spending to get back on track.`;
    }

    // Progress tips based on percentage
    if (progress < 25) {
      return `Focus on reducing your ${goal.category} spending to increase your savings. Try to save at least ${formatCurrency(goal.target_amount * 0.25, currencyCode as CurrencyCode)} this month.`;
    } else if (progress < 50) {
      return "You're making progress! Keep reducing expenses to reach your goal faster.";
    } else if (progress < 75) {
      return "Great progress! You're well on your way to reaching your goal.";
    } else if (progress < 100) {
      return "Almost there! Just a little more savings to reach your target.";
    } else {
      return "Congratulations! You've reached your savings goal!";
    }
  };

  return {
    calculateCategorySavings,
    calculateProgress,
    generateTip
  };
}
