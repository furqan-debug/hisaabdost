
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Budget } from "@/pages/Budget";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({
  budgets
}: BudgetOverviewProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  const data = budgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    percentage: (budget.amount / totalBudget * 100).toFixed(0)
  }));

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center space-y-3">
        <p className="text-muted-foreground">No budget categories found</p>
        <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1, // Fixed: Removed the extra comma and added the correct value
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="h-full space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-xl bg-background/50 backdrop-blur-sm py-6 md:p-8 px-4">
        <div className="w-full h-full min-h-[300px] relative pie-chart-container chart-wrapper">
          <div className="chart-center-total">
            <div className="chart-center-total-amount">
              {formatCurrency(totalBudget, currencyCode)}
            </div>
            <div className="chart-center-total-label">
              Total Budget
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={data} 
                cx="50%" 
                cy="50%" 
                innerRadius={isMobile ? 60 : 80} 
                outerRadius={isMobile ? 85 : 110} 
                paddingAngle={2} 
                dataKey="value" 
                cornerRadius={4} 
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-sm tooltip-card"
                    >
                      <p className="text-sm font-semibold">{data.name}</p>
                      <p className="text-sm">{formatCurrency(data.value, currencyCode)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.percentage}% of total
                      </p>
                    </motion.div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="expense-chart-legend mt-6">
          {data.slice(0, isMobile ? 4 : 6).map((entry, index) => (
            <motion.div 
              key={index} 
              className="expense-chart-legend-item" 
              variants={itemVariants}
            >
              <div 
                className="expense-chart-legend-dot" 
                style={{
                  backgroundColor: CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]
                }} 
              />
              <span className="truncate">{entry.name}</span>
              <span className="ml-auto font-medium">{entry.percentage}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
