
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface SpendingTrendsWidgetProps {
  expenses: Array<{
    id: string;
    amount: number;
    date: string;
    category: string;
    description: string;
  }>;
  isLoading?: boolean;
}

export function SpendingTrendsWidget({ expenses, isLoading }: SpendingTrendsWidgetProps) {
  const { currencyCode } = useCurrency();

  // Process real expense data for the last 6 months
  const trendsData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const now = new Date();
    const monthsData = [];

    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Filter expenses for this month
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });

      // Calculate total amount for this month
      const totalAmount = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

      // For consistency, if there are no expenses at all for the account, 
      // don't show any phantom data points with amount 0
      // Only add a month with zero if there are expenses in other months
      if (expenses.length === 0 && totalAmount === 0) {
        continue;
      }

      monthsData.push({
        date: format(monthDate, 'yyyy-MM-dd'),
        month: format(monthDate, 'MMM'),
        amount: totalAmount
      });
    }

    return monthsData;
  }, [expenses]);

  // Check if this is a new account
  const isNewAccount = expenses.length <= 3;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading trends...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrend = () => {
    // For new accounts with minimal data, don't calculate trends
    if (isNewAccount || trendsData.length < 2) {
      return { direction: 'neutral', percentage: 0 };
    }
    
    const current = trendsData[trendsData.length - 1]?.amount || 0;
    const previous = trendsData[trendsData.length - 2]?.amount || 0;
    
    if (previous === 0) return { direction: 'neutral', percentage: 0 };
    
    const percentage = ((current - previous) / previous) * 100;
    
    return {
      direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'neutral',
      percentage: Math.abs(percentage)
    };
  };

  const trend = getTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendText = () => {
    // For new accounts with minimal data, show a neutral message
    if (isNewAccount || trend.percentage === 0) {
      return 'Stable spending';
    }

    switch (trend.direction) {
      case 'up':
        return `${trend.percentage.toFixed(1)}% increase`;
      case 'down':
        return `${trend.percentage.toFixed(1)}% decrease`;
      default:
        return 'Stable spending';
    }
  };

  // Check if we have real data to display
  const hasRealData = trendsData.some(data => data.amount > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Spending Trends</CardTitle>
        <div className={`flex items-center gap-2 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">{getTrendText()}</span>
        </div>
      </CardHeader>
      <CardContent>
        {hasRealData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, currencyCode)}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value, currencyCode), 'Spent']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="mb-2">📈</div>
              <div className="text-sm">No spending data available yet</div>
              <div className="text-xs">Add some expenses to see trends</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
