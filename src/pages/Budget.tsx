
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { Download, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

// Define a type that matches what we store in Supabase
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  carry_forward: boolean;
  created_at: string;
}

const Budget = () => {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');

      if (error) throw error;
      return data;
    },
  });

  const exportBudgetData = () => {
    if (!budgets) return;

    const csvContent = [
      ['Category', 'Amount', 'Period', 'Carry Forward', 'Created At'].join(','),
      ...budgets.map(budget => [
        budget.category,
        budget.amount,
        budget.period,
        budget.carry_forward,
        format(new Date(budget.created_at), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (budgetsLoading || expensesLoading) {
    return <div className="p-4 flex justify-center">
      <div className="animate-pulse text-center">
        <p className="text-muted-foreground">Loading your budget data...</p>
      </div>
    </div>;
  }

  // Calculate total budget and spending
  const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
  const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  const remainingBalance = totalBudget - totalSpent;
  const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-3 md:space-y-6 pb-20 md:pb-8">
      <header className={isMobile ? "px-4 py-2" : "flex justify-between items-center"}>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage and track your budget allocations
          </p>
        </div>
        {isMobile ? (
          <div className="mt-3 flex justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={exportBudgetData}
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => {
                setSelectedBudget(null);
                setShowBudgetForm(true);
              }}
              size="sm"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportBudgetData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => {
              setSelectedBudget(null);
              setShowBudgetForm(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        )}
      </header>

      <div className={`grid gap-3 md:gap-6 px-4 md:px-0 ${isMobile ? 'stat-grid' : 'md:grid-cols-3'}`}>
        <Card className="budget-card">
          <CardHeader className="p-3">
            <CardTitle className="text-base font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        <Card className="budget-card">
          <CardHeader className="p-3">
            <CardTitle className="text-base font-medium">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(remainingBalance)}</div>
          </CardContent>
        </Card>
        <Card className="budget-card">
          <CardHeader className="p-3">
            <CardTitle className="text-base font-medium">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-4 md:mx-0 budget-card">
        <CardContent className="p-3 md:p-6">
          <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="budget-section">
              <BudgetOverview budgets={budgets || []} />
            </TabsContent>

            <TabsContent value="categories" className="budget-section">
              <CategoryBudgets 
                budgets={budgets || []}
                onEditBudget={(budget) => {
                  setSelectedBudget(budget);
                  setShowBudgetForm(true);
                }}
              />
            </TabsContent>

            <TabsContent value="transactions" className="budget-section">
              <BudgetTransactions budgets={budgets || []} />
            </TabsContent>

            <TabsContent value="comparison" className="budget-section">
              <BudgetComparison budgets={budgets || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <BudgetForm
        open={showBudgetForm}
        onOpenChange={setShowBudgetForm}
        budget={selectedBudget}
        onSuccess={() => {
          setShowBudgetForm(false);
          setSelectedBudget(null);
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          toast({
            title: "Success",
            description: `Budget ${selectedBudget ? 'updated' : 'created'} successfully.`,
          });
        }}
      />
      
      {isMobile && (
        <div className="floating-action-button" onClick={() => {
          setSelectedBudget(null);
          setShowBudgetForm(true);
        }}>
          <Plus className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default Budget;
