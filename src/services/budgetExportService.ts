
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Budget } from "@/pages/Budget";
import { isNativePlatform, downloadFileOnMobile, downloadFileOnWeb } from "@/utils/mobileExportUtils";

export const exportBudgetData = async (
  budgets: Budget[] | undefined,
  expenses: any[] | undefined,
  selectedMonth: Date
) => {
  if (!budgets || budgets.length === 0) {
    toast({
      title: "No Budget Data",
      description: "No budget data available to export.",
      variant: "destructive"
    });
    return;
  }

  try {
    console.log('Starting budget export...');
    
    // Add UTF-8 BOM for proper encoding
    const BOM = '\uFEFF';
    
    // Calculate spending for each budget category
    const budgetWithSpending = budgets.map(budget => {
      const categoryExpenses = expenses?.filter(expense => expense.category === budget.category) || [];
      const totalSpent = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const remaining = Number(budget.amount) - totalSpent;
      const usagePercentage = Number(budget.amount) > 0 ? (totalSpent / Number(budget.amount)) * 100 : 0;
      
      return {
        category: budget.category,
        budgetAmount: Number(budget.amount),
        period: budget.period,
        totalSpent: totalSpent,
        remaining: remaining,
        usagePercentage: usagePercentage.toFixed(1),
        carryForward: budget.carry_forward ? 'Yes' : 'No',
        createdAt: format(new Date(budget.created_at), 'yyyy-MM-dd')
      };
    });
    
    // Add Hisaab Dost branding in header
    const headers = ['Category', 'Budget Amount', 'Period', 'Total Spent', 'Remaining', 'Usage %', 'Carry Forward', 'Created Date'];
    const csvContent = BOM + [
      'Hisaab Dost - Budget Report',
      `Generated on: ${format(new Date(), 'PPP')}`,
      `Report Period: ${format(selectedMonth, 'MMMM yyyy')}`,
      '',
      headers.join(','),
      ...budgetWithSpending.map(budget => [
        `"${budget.category}"`,
        budget.budgetAmount,
        budget.period,
        budget.totalSpent,
        budget.remaining,
        `${budget.usagePercentage}%`,
        budget.carryForward,
        budget.createdAt
      ].join(','))
    ].join('\n');

    const filename = `Hisaab_Dost_Budget_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    const mimeType = 'text/csv;charset=utf-8;';

    console.log('Budget CSV content prepared, filename:', filename);

    // Check if running on mobile platform
    if (isNativePlatform()) {
      console.log('Using native platform for budget download');
      await downloadFileOnMobile(csvContent, filename, mimeType, false);
    } else {
      console.log('Using web download for budget');
      downloadFileOnWeb(csvContent, filename, mimeType);
    }

  } catch (error) {
    console.error('Error exporting budget data:', error);
    toast({
      title: "Budget Export Failed",
      description: "Failed to export budget data. Please try again.",
      variant: "destructive"
    });
  }
};
