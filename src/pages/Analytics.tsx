import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { subMonths, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useMonthContext } from "@/hooks/use-month-context";
import { motion } from "framer-motion";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsTabs } from "@/components/analytics/AnalyticsTabs";
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
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
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
  return <div className="space-y--6 md:px-6 pt-4 pb-24 md:pb-8  my-0 px-[5px]">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={itemVariants}>
            <AnalyticsHeader />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ExpenseFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} dateRange={dateRange} setDateRange={setDateRange} selectedMonth={selectedMonth} useCustomDateRange={useCustomDateRange} className="mx-0 px-0" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnalyticsTabs filteredExpenses={filteredExpenses} />
          </motion.div>
        </motion.div>
    </div>;
}