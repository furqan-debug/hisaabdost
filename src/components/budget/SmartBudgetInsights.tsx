
import { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/chartUtils';

export function SmartBudgetInsights() {
  const [insights, setInsights] = useState<string>('');
  const { toast } = useToast();
  const { generateResponse, isLoading } = useAI({
    onError: (error) => {
      toast({
        title: 'Error generating insights',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

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

  const generateInsights = async () => {
    if (!expenses || !budgets) return;

    // Calculate total spent by category
    const spentByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    // Prepare data for AI analysis
    const budgetData = budgets.map(budget => ({
      category: budget.category,
      budgeted: budget.amount,
      spent: spentByCategory[budget.category] || 0,
    }));

    const prompt = `
      As a financial advisor, analyze this budget and expense data and provide key insights:
      
      Budget Data:
      ${budgetData.map(b => `${b.category}: Budgeted ${formatCurrency(b.budgeted)}, Spent ${formatCurrency(b.spent)}`).join('\n')}
      
      Please provide:
      1. Top spending categories
      2. Categories with significant overspending
      3. Potential savings opportunities
      4. Specific recommendations for improvement
      
      Keep the response concise and actionable.
    `;

    try {
      const response = await generateResponse(prompt, 'analyze');
      setInsights(response.analysis);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  // Generate insights when data is available
  useEffect(() => {
    if (expenses && budgets && !insights) {
      generateInsights();
    }
  }, [expenses, budgets]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Smart Budget Insights</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={generateInsights}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="space-y-4">
            <div className="whitespace-pre-wrap text-sm">{insights}</div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
