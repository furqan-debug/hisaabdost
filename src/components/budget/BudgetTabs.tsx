
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { Budget } from "@/pages/Budget";

interface BudgetTabsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export const BudgetTabs = ({ budgets, onEditBudget }: BudgetTabsProps) => {
  return (
    <Card className="budget-card overflow-hidden">
      <CardContent className="p-0 md:p-6 max-w-full overflow-hidden">
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden">
          <TabsList className="w-full justify-start px-0 mx-0 rounded-none md:rounded-md max-w-full overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="budget-section overflow-hidden w-full">
            <BudgetOverview budgets={budgets || []} />
          </TabsContent>

          <TabsContent value="categories" className="budget-section overflow-hidden w-full">
            <CategoryBudgets 
              budgets={budgets || []}
              onEditBudget={onEditBudget}
            />
          </TabsContent>

          <TabsContent value="transactions" className="budget-section overflow-hidden w-full">
            <BudgetTransactions budgets={budgets || []} />
          </TabsContent>

          <TabsContent value="comparison" className="budget-section overflow-hidden w-full">
            <BudgetComparison budgets={budgets || []} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
