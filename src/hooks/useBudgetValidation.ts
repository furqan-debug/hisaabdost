import { useMemo } from "react";
import { useWalletAdditions } from "@/hooks/useWalletAdditions";
import { Budget } from "@/pages/Budget";

export interface BudgetValidationResult {
  sustainabilityWarning: {
    show: boolean;
    message: string;
    exceedAmount: number;
  };
  affordabilityWarning: {
    show: boolean;
    message: string;
    shortfallAmount: number;
  };
}

interface UseBudgetValidationProps {
  budgets: Budget[];
  currentAmount: number;
  currentPeriod: 'monthly' | 'quarterly' | 'yearly';
  monthlyIncome: number;
  editingBudget?: Budget | null;
}

export function useBudgetValidation({
  budgets,
  currentAmount,
  currentPeriod,
  monthlyIncome,
  editingBudget
}: UseBudgetValidationProps): BudgetValidationResult {
  const { totalAdditions } = useWalletAdditions();

  return useMemo(() => {
    // Calculate total monthly budget commitment from all existing budgets
    const calculateMonthlyCommitment = (budgetList: Budget[]) => {
      return budgetList.reduce((total, budget) => {
        // Skip the budget we're currently editing to avoid double counting
        if (editingBudget && budget.id === editingBudget.id) {
          return total;
        }

        let monthlyAmount = budget.amount;
        
        // Convert different periods to monthly equivalents
        switch (budget.period) {
          case 'weekly':
            monthlyAmount = budget.amount * 4.33; // Average weeks per month
            break;
          case 'yearly':
            monthlyAmount = budget.amount / 12; // 12 months
            break;
          case 'monthly':
          default:
            monthlyAmount = budget.amount;
            break;
        }
        
        return total + monthlyAmount;
      }, 0);
    };

    // Calculate current monthly commitment from existing budgets
    const currentMonthlyCommitment = calculateMonthlyCommitment(budgets);
    
    // Convert the new budget amount to monthly equivalent
    let newBudgetMonthlyAmount = currentAmount;
    switch (currentPeriod) {
      case 'quarterly':
        newBudgetMonthlyAmount = currentAmount / 3; // 3 months
        break;
      case 'yearly':
        newBudgetMonthlyAmount = currentAmount / 12;
        break;
      case 'monthly':
      default:
        newBudgetMonthlyAmount = currentAmount;
        break;
    }

    // Total monthly commitment including the new budget
    const totalMonthlyCommitment = currentMonthlyCommitment + newBudgetMonthlyAmount;

    // Level 1: Long-term sustainability check
    const sustainabilityExceeds = monthlyIncome > 0 && totalMonthlyCommitment > monthlyIncome;
    const sustainabilityExceedAmount = sustainabilityExceeds ? totalMonthlyCommitment - monthlyIncome : 0;

    // Level 2: Current month affordability check
    // Calculate what the current month's budget needs would be
    const currentMonthBudgetNeeds = budgets.reduce((total, budget) => {
      // Skip the budget we're editing
      if (editingBudget && budget.id === editingBudget.id) {
        return total;
      }

      // For current month, use the full amount regardless of period
      // (assuming users want to allocate the full budget amount for planning)
      return total + budget.amount;
    }, 0) + currentAmount;

    // Current wallet balance = monthly income + wallet additions - we assume no expenses for simplicity
    // Note: In a real scenario, you might want to subtract current month expenses
    const currentWalletBalance = monthlyIncome + totalAdditions;
    
    const affordabilityShortfall = currentMonthBudgetNeeds > currentWalletBalance;
    const affordabilityShortfallAmount = affordabilityShortfall ? currentMonthBudgetNeeds - currentWalletBalance : 0;

    return {
      sustainabilityWarning: {
        show: sustainabilityExceeds,
        message: `Your total monthly budget commitment (${totalMonthlyCommitment.toFixed(0)}) will exceed your monthly income by ${sustainabilityExceedAmount.toFixed(0)}. Consider adjusting your budget allocation for long-term sustainability.`,
        exceedAmount: sustainabilityExceedAmount
      },
      affordabilityWarning: {
        show: affordabilityShortfall,
        message: `Your planned budgets for this month (${currentMonthBudgetNeeds.toFixed(0)}) exceed your current available funds by ${affordabilityShortfallAmount.toFixed(0)}. You may need to add more funds to your wallet or adjust your budget amounts.`,
        shortfallAmount: affordabilityShortfallAmount
      }
    };
  }, [budgets, currentAmount, currentPeriod, monthlyIncome, editingBudget, totalAdditions]);
}