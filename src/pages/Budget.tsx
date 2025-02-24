
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { SmartBudgetInsights } from "@/components/budget/SmartBudgetInsights";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: "monthly" | "quarterly" | "yearly";
  carry_forward: boolean;
}

export default function Budget() {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');
      if (error) throw error;
      return data as Budget[];
    },
  });

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetForm(true);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Budget</h1>
          <p className="text-muted-foreground">
            Manage and track your budget across different categories
          </p>
        </div>
        <Button onClick={() => setShowBudgetForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-6">
        <SmartBudgetInsights />
        
        <BudgetOverview budgets={budgets} />
        
        <CategoryBudgets
          budgets={budgets}
          onEditBudget={handleEditBudget}
        />
        
        <BudgetComparison budgets={budgets} />
      </div>

      <BudgetForm
        open={showBudgetForm}
        onOpenChange={setShowBudgetForm}
        budget={selectedBudget}
        onSuccess={() => {
          setShowBudgetForm(false);
          setSelectedBudget(null);
        }}
      />
    </div>
  );
}
