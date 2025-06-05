
import React from 'react';
import { useDashboardData } from '@/components/dashboard/useDashboardData';
import { useMonthContext } from '@/hooks/use-month-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MonthSelector } from '@/components/MonthSelector';
import { MonthlySummaryCards } from '@/components/monthly-summary/MonthlySummaryCards';
import { ActivityHistorySection } from '@/components/monthly-summary/ActivityHistorySection';

const History = () => {
  const { selectedMonth, setSelectedMonth } = useMonthContext();
  const {
    isLoading,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    walletBalance,
    formatPercentage
  } = useDashboardData();

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header with Month Selector */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
              <div className="w-full sm:w-auto">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-full sm:w-48"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Financial overview for {format(selectedMonth, 'MMMM yyyy')}
            </p>
          </CardHeader>
        </Card>

        {/* Monthly Financial Overview */}
        <MonthlySummaryCards
          walletBalance={walletBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          savingsRate={savingsRate}
          isLoading={isLoading}
        />

        {/* Activity History Section */}
        <ActivityHistorySection selectedMonth={selectedMonth} />
      </div>
    </div>
  );
};

export default History;
