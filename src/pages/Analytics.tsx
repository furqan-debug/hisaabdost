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
import { CATEGORY_COLORS } from "@/utils/chartUtils";

export default function Analytics() {
  const { user } = useAuth();
  const { year, month } = useMonthContext();
  const [startDate] = useState(format(subMonths(new Date(year, month - 1, 1), 5), "yyyy-MM-dd"));
  const [endDate] = useState(format(new Date(year, month - 1, 1), "yyyy-MM-dd"));

  // Fetch expenses for the selected month range
  const { data: expenses = [], isLoading } = useQuery(
    ["expenses", user?.id, startDate, endDate],
    async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .eq("user_id", user?.id);
      if (error) throw error;
      return data || [];
    }
  );

  // Get any analytical insights
  const insights = useAnalyticsInsights(expenses);

  // Framer Motion variants for animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Filtered expenses for current month (for charts)
  const filteredExpenses = expenses;

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {/* Header and filters */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your spending patterns and financial trends
        </p>
        <ExpenseFilters />
      </motion.div>

      {/* Insights cards */}
      <motion.div variants={itemVariants}>
        {insights && insights.length > 0 ? (
          <InsightsDisplay insights={insights} />
        ) : isLoading ? (
          <Skeleton className="w-full h-32" />
        ) : (
          <Alert>
            <AlertDescription>No insights available for this period.</AlertDescription>
          </Alert>
        )}
      </motion.div>

      {/* Analytics charts tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4 mt-2">
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
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Your expenses by category</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ExpensesPieChart expenses={filteredExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 mt-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ExpensesLineChart expenses={filteredExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 mt-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
                <CardDescription>Compare your spending by category</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ExpensesComparison expenses={filteredExpenses} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
