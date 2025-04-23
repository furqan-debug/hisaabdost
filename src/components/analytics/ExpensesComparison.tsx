
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface ExpensesComparisonProps {
  expenses: Expense[];
}

export function ExpensesComparison({ expenses }: ExpensesComparisonProps) {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(lastMonthStart);

  const currentMonthExpenses = expenses.filter(
    expense => new Date(expense.date) >= currentMonthStart
  );

  const lastMonthExpenses = expenses.filter(
    expense => {
      const date = new Date(expense.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }
  );

  const getCategoryTotal = (expenses: Expense[], category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const categories = Object.keys(CATEGORY_COLORS);
  const comparisons = categories.map(category => {
    const currentAmount = getCategoryTotal(currentMonthExpenses, category);
    const lastAmount = getCategoryTotal(lastMonthExpenses, category);
    const percentageChange = lastAmount === 0
      ? (currentAmount > 0 ? 100 : 0)
      : ((currentAmount - lastAmount) / lastAmount) * 100;
      
    // Calculate the ratio for progress bar
    const ratio = lastAmount === 0 
      ? (currentAmount > 0 ? 100 : 0)
      : Math.min(200, Math.max(0, (currentAmount / lastAmount) * 100));

    return {
      category,
      currentAmount,
      lastAmount,
      percentageChange,
      ratio,
      color: CATEGORY_COLORS[category],
    };
  }).filter(comparison => comparison.currentAmount > 0 || comparison.lastAmount > 0)
    .sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="rounded-xl shadow-sm bg-[#f4fdf8]/60 border border-[#e0e5e9] dark:bg-[#051a10]/60 dark:border-[#1a2e25]">
          <CardContent className="pt-4 pb-3 px-4">
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
                {format(currentMonthStart, 'MMMM yyyy')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Current Month</div>
            </motion.div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl shadow-sm bg-[#f1f2ff]/60 border border-[#e1e5ee] dark:bg-[#0a0f24]/60 dark:border-[#1a1e32]">
          <CardContent className="pt-4 pb-3 px-4">
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
                {format(lastMonthStart, 'MMMM yyyy')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Previous Month</div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-5">
        {comparisons.length > 0 ? (
          comparisons.map((comparison, i) => {
            const { category, currentAmount, lastAmount, percentageChange, ratio, color } = comparison;
            const isIncrease = percentageChange > 0;
            const isUnchanged = Math.abs(percentageChange) < 0.1;
            
            return (
              <motion.div 
                key={category}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-[15px]">{category}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 font-bold text-[14px]",
                    isIncrease ? "text-red-500 dark:text-red-400" : 
                    isUnchanged ? "text-gray-500 dark:text-gray-400" : 
                    "text-green-500 dark:text-green-400"
                  )}>
                    {isIncrease ? (
                      <TrendingUpIcon className="w-3.5 h-3.5" />
                    ) : isUnchanged ? (
                      <MinusIcon className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDownIcon className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isIncrease ? "+" : ""}{Math.abs(percentageChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(currentAmount, currencyCode)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(lastAmount, currencyCode)}
                    </div>
                  </div>
                </div>
                
                <div className="h-3 bg-[#e9ecef] dark:bg-[#222] rounded-full overflow-hidden relative">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      isIncrease ? "bg-red-400 dark:bg-red-500" : 
                      isUnchanged ? "bg-gray-400 dark:bg-gray-500" :
                      "bg-green-400 dark:bg-green-500"
                    )}
                    style={{ width: `${ratio}%`, maxWidth: '100%' }}
                  />
                  {/* Vertical line marking the 100% point */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white/40 dark:bg-black/40" style={{ left: '100%' }} />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Not enough data to compare this period.
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
