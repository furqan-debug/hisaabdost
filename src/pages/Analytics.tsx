
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
import { useIsMobile } from "@/hooks/use-mobile";

export default function Analytics() {
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const useCustomDateRange = true;
  const isMobile = useIsMobile();

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

  const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => {
    acc[key] = { color };
    return acc;
  }, {} as Record<string, { color: string }>);

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
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="space-y-6 pb-16 sm:pb-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold tracking-tight gradient-text`}>
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">Track your spending patterns and financial trends</p>
        <ExpenseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedMonth={selectedMonth}
          useCustomDateRange={useCustomDateRange}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <InsightsDisplay insights={insights} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-2">
            <Card className="overflow-hidden">
              <CardHeader className={isMobile ? "p-3" : ""}>
                <CardTitle className={isMobile ? "text-base" : ""}>Category Breakdown</CardTitle>
                <CardDescription className={isMobile ? "text-xs" : ""}>
                  Your expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-0 h-[280px]' : 'h-[400px]'} card-content-chart`}>
                <ChartContainer config={chartConfig} className="h-full">
                  <ExpensesPieChart expenses={filteredExpenses} />
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 mt-2">
            <Card className="overflow-hidden">
              <CardHeader className={isMobile ? "p-3" : ""}>
                <CardTitle className={isMobile ? "text-base" : ""}>Monthly Trends</CardTitle>
                <CardDescription className={isMobile ? "text-xs" : ""}>
                  Your spending patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-0 h-[280px]' : 'h-[400px]'} card-content-chart`}>
                <ChartContainer config={chartConfig} className="h-full">
                  <ExpensesBarChart expenses={filteredExpenses} />
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className={isMobile ? "p-3" : ""}>
                <CardTitle className={isMobile ? "text-base" : ""}>Category Trends</CardTitle>
                <CardDescription className={isMobile ? "text-xs" : ""}>
                  How your spending evolves by category
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-0 h-[280px]' : 'h-[400px]'} card-content-chart`}>
                <ChartContainer config={chartConfig} className="h-full">
                  <ExpensesLineChart expenses={filteredExpenses} />
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 mt-2">
            <Card>
              <CardHeader className={isMobile ? "p-3" : ""}>
                <CardTitle className={isMobile ? "text-base" : ""}>Period Comparison</CardTitle>
                <CardDescription className={isMobile ? "text-xs" : ""}>
                  Compare your spending across different periods
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? "p-2" : ""}>
                <ExpensesComparison expenses={filteredExpenses} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
