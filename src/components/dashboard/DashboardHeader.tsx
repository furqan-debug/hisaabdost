
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  totalExpenses: number;
  onAddExpense: () => void;
}

export const DashboardHeader = ({ 
  totalExpenses, 
  onAddExpense 
}: DashboardHeaderProps) => {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();

  return (
    <header className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>
      
      <div className="flex justify-center items-center space-x-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-xl font-semibold">
            {formatCurrency(totalExpenses, currencyCode)}
          </p>
        </div>
        
        <Button 
          variant="default" 
          size={isMobile ? "sm" : "default"}
          onClick={onAddExpense}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
    </header>
  );
};
