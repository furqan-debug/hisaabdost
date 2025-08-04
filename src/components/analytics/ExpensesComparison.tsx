
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { useExpensesComparison } from "./comparison/useExpensesComparison";
import { MonthCards } from "./comparison/MonthCards";
import { ComparisonItem } from "./comparison/ComparisonItem";
import { useAllCategories } from "@/hooks/useAllCategories";

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
  const { categories } = useAllCategories();
  
  // Create category colors map from all categories
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color;
    return acc;
  }, {} as Record<string, string>);
  
  const { currentMonthStart, lastMonthStart, comparisons } = useExpensesComparison(expenses, categoryColors);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm">
      <MonthCards
        currentMonthStart={currentMonthStart}
        lastMonthStart={lastMonthStart}
      />
      
      <div className="space-y-5">
        {comparisons.length > 0 ? (
          comparisons.map((comparison, i) => (
            <ComparisonItem
              key={comparison.category}
              {...comparison}
              index={i}
              currencyCode={currencyCode}
            />
          ))
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
