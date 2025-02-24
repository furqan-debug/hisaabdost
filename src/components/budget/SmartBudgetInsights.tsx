
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/chartUtils';

export function SmartBudgetInsights() {
  // Fetch expenses and budgets
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Calculate basic insights
  const getBasicInsights = () => {
    if (!expenses || !budgets) return null;

    // Calculate total spent by category
    const spentByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    // Find categories over budget
    const overBudgetCategories = budgets
      .filter(budget => (spentByCategory[budget.category] || 0) > budget.amount)
      .map(budget => ({
        category: budget.category,
        budgeted: budget.amount,
        spent: spentByCategory[budget.category] || 0,
        overspent: (spentByCategory[budget.category] || 0) - budget.amount
      }))
      .sort((a, b) => b.overspent - a.overspent);

    // Calculate total budget and spending
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = Object.values(spentByCategory).reduce((sum, amount) => sum + amount, 0);

    return {
      totalBudget,
      totalSpent,
      overBudgetCategories
    };
  };

  const insights = getBasicInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Total Budget: {formatCurrency(insights.totalBudget)}</p>
                <p className="text-sm font-medium">Total Spent: {formatCurrency(insights.totalSpent)}</p>
              </div>
              
              {insights.overBudgetCategories.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Categories Over Budget:</p>
                  <ul className="space-y-2">
                    {insights.overBudgetCategories.map(cat => (
                      <li key={cat.category} className="text-sm">
                        {cat.category}: Over by {formatCurrency(cat.overspent)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No budget data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
