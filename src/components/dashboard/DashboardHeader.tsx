
import React from "react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";

interface DashboardHeaderProps {
  isNewUser: boolean;
}

export const DashboardHeader = ({ isNewUser }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() && 
                        selectedMonth.getFullYear() === new Date().getFullYear();
  
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold text-foreground">
        {isNewUser ? `Welcome, ${user?.user_metadata?.full_name || 'there'}!` : isCurrentMonth ? 'Dashboard' : `${format(selectedMonth, 'MMMM yyyy')}`}
      </h1>
      <p className="text-muted-foreground text-sm">
        {isNewUser 
          ? "Let's start tracking your expenses. Add your first expense to get started!"
          : isCurrentMonth 
            ? "Here's an overview of your expenses" 
            : `Viewing your financial data for ${format(selectedMonth, 'MMMM yyyy')}`}
      </p>
    </header>
  );
};
