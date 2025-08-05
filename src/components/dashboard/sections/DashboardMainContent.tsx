
import React from "react";
import { ProfessionalDashboardLayout } from "./ProfessionalDashboardLayout";

interface DashboardMainContentProps {
  isNewUser: boolean;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  walletBalance: number;
  expenses: any[];
  allExpenses: any[];
  isExpensesLoading: boolean;
  setShowAddExpense: (show: boolean) => void;
  onAddExpense: () => void;
  onUploadReceipt: () => void;
  onTakePhoto: () => void;
  onAddBudget: () => void;
}

export const DashboardMainContent = (props: DashboardMainContentProps) => {
  return <ProfessionalDashboardLayout {...props} />;
};
