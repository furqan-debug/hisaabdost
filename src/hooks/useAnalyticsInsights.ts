
import { TrendingDownIcon, TrendingUpIcon, AlertTriangleIcon, SparklesIcon } from "lucide-react";
import { subMonths, isAfter, isBefore } from "date-fns";

interface Expense {
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Insight {
  type: 'highlight' | 'alert' | 'warning' | 'success' | 'tip';
  icon: JSX.Element;
  message: string;
  recommendation: string | null;
}

export function useAnalyticsInsights(filteredExpenses: Expense[]) {
  if (!filteredExpenses.length) return [];

  const insights: Insight[] = [];
  const currentDate = new Date();
  const lastMonthStart = subMonths(currentDate, 1);
  
  // Helper function to check if a date is within the last month
  const isWithinLastMonth = (date: Date) => {
    return isAfter(date, lastMonthStart) && isBefore(date, currentDate);
  };
  
  const lastMonthExpenses = filteredExpenses.filter(exp => 
    isWithinLastMonth(new Date(exp.date))
  );
  
  // Calculate basic metrics
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const avgExpense = totalExpenses / filteredExpenses.length;
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Category analysis
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a);

  // 1. Highest spending category insight
  const highestCategory = sortedCategories[0];
  if (highestCategory) {
    const categoryPercentage = (highestCategory[1] / totalExpenses) * 100;
    insights.push({
      type: 'highlight',
      icon: <TrendingUpIcon className="h-4 w-4 text-orange-500" />,
      message: `Your highest spending category is ${highestCategory[0]} at ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(highestCategory[1])} (${categoryPercentage.toFixed(1)}% of total)`,
      recommendation: categoryPercentage > 40 ? 
        "Consider setting a budget limit for this category as it represents a significant portion of your expenses." : 
        null
    });
  }

  // 2. Unusual transactions insight
  const highTransactions = filteredExpenses.filter(exp => Number(exp.amount) > avgExpense * 1.5);
  if (highTransactions.length > 0) {
    insights.push({
      type: 'alert',
      icon: <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />,
      message: `You have ${highTransactions.length} unusually large transactions that are 50% above your average expense of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgExpense)}`,
      recommendation: "Review these transactions to ensure they were planned expenses."
    });
  }

  // 3. Monthly trend insight
  if (lastMonthExpenses.length > 0) {
    const monthlyAvg = lastMonthTotal / lastMonthExpenses.length;
    const previousAvg = (totalExpenses - lastMonthTotal) / (filteredExpenses.length - lastMonthExpenses.length);
    const monthlyChange = ((monthlyAvg - previousAvg) / previousAvg) * 100;

    if (Math.abs(monthlyChange) > 10) {
      insights.push({
        type: monthlyChange > 0 ? 'warning' : 'success',
        icon: monthlyChange > 0 ? 
          <TrendingUpIcon className="h-4 w-4 text-red-500" /> : 
          <TrendingDownIcon className="h-4 w-4 text-green-500" />,
        message: `Your average spending ${monthlyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(monthlyChange).toFixed(1)}% compared to the previous period`,
        recommendation: monthlyChange > 0 ? 
          "Consider reviewing your recent spending habits and identify areas for potential savings." :
          "Great job on reducing your expenses! Keep maintaining these positive spending habits."
      });
    }
  }

  // 4. Potential savings insight
  const smallCategories = sortedCategories
    .filter(([,amount]) => (amount / totalExpenses) < 0.05);
  
  if (smallCategories.length > 0) {
    const savingsTotal = smallCategories.reduce((sum, [,amount]) => sum + amount, 0);
    insights.push({
      type: 'tip',
      icon: <SparklesIcon className="h-4 w-4 text-blue-500" />,
      message: `You could save ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingsTotal)} by optimizing spending in smaller categories`,
      recommendation: "Consider consolidating or eliminating expenses in these smaller categories for potential savings."
    });
  }

  return insights;
}
