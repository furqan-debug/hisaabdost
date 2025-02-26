
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesPieChart } from "@/components/analytics/ExpensesPieChart";
import { ExpensesBarChart } from "@/components/analytics/ExpensesBarChart";
import { ExpensesLineChart } from "@/components/analytics/ExpensesLineChart";
import { ExpensesComparison } from "@/components/analytics/ExpensesComparison";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SparklesIcon, TrendingDownIcon, TrendingUpIcon, AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import { subMonths, format, isAfter, isBefore } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

export default function Analytics() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ['expenses', dateRange, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const generateInsights = () => {
    if (!filteredExpenses.length) return [];

    const insights = [];
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
  };

  const insights = generateInsights();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading expenses data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <ExpenseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <Alert key={index} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
            <div className="flex gap-2">
              {insight.icon}
              <div className="space-y-1">
                <AlertDescription>{insight.message}</AlertDescription>
                {insight.recommendation && (
                  <AlertDescription className="text-sm text-muted-foreground">
                    💡 {insight.recommendation}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Your expenses by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ExpensesPieChart expenses={filteredExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Your spending patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ExpensesBarChart expenses={filteredExpenses} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Trends</CardTitle>
              <CardDescription>How your spending evolves by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ExpensesLineChart expenses={filteredExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Comparison</CardTitle>
              <CardDescription>Compare your spending across different periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesComparison expenses={filteredExpenses} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
