
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
import { useState } from "react";
import { subMonths, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import { InsightsDisplay } from "@/components/analytics/InsightsDisplay";

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

  const insights = useAnalyticsInsights(filteredExpenses);

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

      <InsightsDisplay insights={insights} />

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
