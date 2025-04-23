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
import { useMonthContext } from "@/hooks/use-month-context";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/utils/chartUtils";

export default function Analytics() {
  const {
    user
  } = useAuth();
  const {
    selectedMonth
  } = useMonthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const useCustomDateRange = true;
  const {
    data: expenses,
    isLoading,
    error
  } = useQuery({
    queryKey: ['expenses', dateRange, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const {
        data,
        error
      } = await supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', dateRange.start).lte('date', dateRange.end).order('date', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];
  const insights = useAnalyticsInsights(filteredExpenses);
  const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => {
    acc[key] = {
      color
    };
    return acc;
  }, {} as Record<string, {
    color: string;
  }>);
  if (error) {
    return <Alert variant="destructive">
        <AlertDescription>Error loading expenses data. Please try again later.</AlertDescription>
      </Alert>;
  }
  if (isLoading) {
    return <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>;
  }
  return (
    <div className="space-y-8 px-4 md:px-8 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your spending patterns and financial trends
          </p>
        </div>

        <ExpenseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedMonth={selectedMonth}
          useCustomDateRange={useCustomDateRange}
          className="mx-0 px-0"
        />

        <InsightsDisplay insights={insights} />

        <Card className="border-0 shadow-sm bg-background/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger 
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="trends"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Trends
                </TabsTrigger>
                <TabsTrigger 
                  value="comparison"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Comparison
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-6">
                <TabsContent value="overview">
                  <Card className="border-0 shadow-sm bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Category Breakdown</CardTitle>
                      <CardDescription>Your expenses by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ChartContainer config={chartConfig}>
                        <ExpensesPieChart expenses={filteredExpenses} />
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  <Card className="border-0 shadow-sm bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Monthly Trends</CardTitle>
                      <CardDescription>Your spending patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ChartContainer config={chartConfig}>
                        <ExpensesBarChart expenses={filteredExpenses} />
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Category Trends</CardTitle>
                      <CardDescription>How your spending evolves by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ChartContainer config={chartConfig}>
                        <ExpensesLineChart expenses={filteredExpenses} />
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparison">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="px-0">
                      <ExpensesComparison expenses={filteredExpenses} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
