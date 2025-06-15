
import { formatCurrency } from '@/utils/formatters';
import { CurrencyCode } from '@/utils/currencyUtils';

interface Expense {
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
}

export interface LocalInsight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  icon: string;
  action?: string;
}

export class LocalInsightsService {
  static generateInsights(
    expenses: Expense[], 
    budgets: Budget[], 
    monthlyIncome: number,
    currencyCode: CurrencyCode
  ): LocalInsight[] {
    const insights: LocalInsight[] = [];
    
    // Calculate current month totals
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    
    const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    
    // Budget adherence insights
    if (totalBudget > 0) {
      const budgetUsage = (totalSpent / totalBudget) * 100;
      
      if (budgetUsage > 90) {
        insights.push({
          type: 'warning',
          title: 'Budget Alert',
          message: `You've used ${budgetUsage.toFixed(1)}% of your budget this month (${formatCurrency(totalSpent, currencyCode)} of ${formatCurrency(totalBudget, currencyCode)})`,
          icon: '⚠️',
          action: 'Review spending categories'
        });
      } else if (budgetUsage < 70) {
        insights.push({
          type: 'success',
          title: 'Great Progress',
          message: `You're doing well! Only ${budgetUsage.toFixed(1)}% of budget used. You have ${formatCurrency(totalBudget - totalSpent, currencyCode)} remaining.`,
          icon: '🎉'
        });
      }
    }
    
    // Category-specific insights
    const categoryTotals = currentMonthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const percentage = (topAmount / totalSpent) * 100;
      
      if (percentage > 40) {
        insights.push({
          type: 'info',
          title: 'Spending Pattern',
          message: `${topCategory} is your biggest expense this month at ${formatCurrency(topAmount, currencyCode)} (${percentage.toFixed(1)}% of total)`,
          icon: '📊',
          action: `Analyze ${topCategory} spending`
        });
      }
    }
    
    // Savings rate insight
    if (monthlyIncome > 0) {
      const savingsRate = ((monthlyIncome - totalSpent) / monthlyIncome) * 100;
      
      if (savingsRate > 20) {
        insights.push({
          type: 'success',
          title: 'Excellent Savings',
          message: `Your savings rate is ${savingsRate.toFixed(1)}%! You're saving ${formatCurrency(monthlyIncome - totalSpent, currencyCode)} this month.`,
          icon: '💰'
        });
      } else if (savingsRate < 10) {
        insights.push({
          type: 'tip',
          title: 'Boost Your Savings',
          message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to aim for at least 10-20% of income.`,
          icon: '💡',
          action: 'Get saving tips'
        });
      }
    }
    
    // Frequent spending insight
    const dailyExpenses = currentMonthExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - expDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    
    if (dailyExpenses.length > 15) {
      insights.push({
        type: 'info',
        title: 'Active Spending Week',
        message: `You've made ${dailyExpenses.length} transactions this week. Consider consolidating small purchases.`,
        icon: '📈',
        action: 'View recent transactions'
      });
    }
    
    return insights.slice(0, 3); // Limit to top 3 insights
  }
  
  static generateMotivationalMessage(
    expenses: Expense[], 
    budgets: Budget[],
    currencyCode: CurrencyCode
  ): string {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    
    if (totalBudget === 0) {
      return "Ready to take control of your finances? Let's start by setting up some budgets! 💪";
    }
    
    const budgetUsage = (totalSpent / totalBudget) * 100;
    
    if (budgetUsage < 50) {
      return `You're crushing it! 🎯 Only ${budgetUsage.toFixed(1)}% of budget used. Keep up the great work!`;
    } else if (budgetUsage < 80) {
      return `Steady progress! 📈 ${budgetUsage.toFixed(1)}% of budget used. You're on track for a great month!`;
    } else if (budgetUsage < 100) {
      return `Almost there! 🏃‍♂️ ${budgetUsage.toFixed(1)}% of budget used. Time to be mindful of spending.`;
    } else {
      return `Let's get back on track! 💪 Focus on essential purchases for the rest of the month.`;
    }
  }
}
