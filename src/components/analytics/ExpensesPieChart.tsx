import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
import { motion } from "framer-motion";
import { useAllCategories } from "@/hooks/useAllCategories";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
interface Expense {
  amount: number;
  category: string;
}
interface ExpensesPieChartProps {
  expenses: Expense[];
}
export function ExpensesPieChart({
  expenses
}: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  const {
    currencyCode
  } = useCurrency();
  const {
    categories
  } = useAllCategories();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Create category colors map from all categories
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color;
    return acc;
  }, {} as Record<string, string>);
  const data = Object.entries(expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#94A3B8',
    percent: 0
  }));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? item.value / total * 100 : 0;
  });
  const mainPercentage = data.length > 0 ? Math.round(data[0].percent) : 0;
  const mainCategory = data.length > 0 ? data[0].name : "No data";
  return <div className="w-full space-y-3">
      {/* Compact Chart with Summary */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Chart Container - Smaller */}
        <div className="relative flex-shrink-0" style={{
        width: isMobile ? '200px' : '240px',
        height: isMobile ? '200px' : '240px'
      }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={isMobile ? 50 : 65} outerRadius={isMobile ? 80 : 100} paddingAngle={2} startAngle={90} endAngle={-270} strokeWidth={0} labelLine={false} label={false}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" className="transition-all duration-300 hover:opacity-80" />)}
              </Pie>
              <Tooltip animationDuration={200} content={({
              active,
              payload
            }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0];
              return <motion.div initial={{
                opacity: 0,
                y: 10,
                scale: 0.9
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} className="rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{
                    backgroundColor: data.payload.color
                  }} />
                        <p className="text-sm font-semibold text-foreground">
                          {data.name}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(Number(data.value), currencyCode)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.payload.percent.toFixed(1)}% of total
                      </p>
                    </motion.div>;
            }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Display */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <motion.div initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.2,
            duration: 0.3
          }} className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-sm border py-[4px]">
              <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-primary`}>
                {mainPercentage}%
              </div>
              <div className="text-xs text-muted-foreground font-medium truncate">
                {mainCategory}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Summary - Horizontal on desktop */}
        <div className="flex-1 w-full">
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.3,
          duration: 0.3
        }} className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {/* Total Expenses */}
            <div className="col-span-2 lg:col-span-1 text-center lg:text-left p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="text-sm text-muted-foreground">Total Expenses</div>
              <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                {formatCurrency(total, currencyCode)}
              </div>
            </div>
            
            {/* Top Categories Preview - Show only top 2 */}
            {data.slice(0, 2).map((entry, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4 + index * 0.1,
            duration: 0.3
          }} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-muted/30">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
              backgroundColor: entry.color
            }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.name}
                    </span>
                    {index === 0 && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        Top
                      </span>}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {entry.percent.toFixed(0)}%
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {formatCurrency(entry.value, currencyCode)}
                    </span>
                  </div>
                </div>
              </motion.div>)}
          </motion.div>
        </div>
      </div>

      {/* Collapsible Details */}
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <CollapsibleTrigger className="flex items-center justify-center w-full p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors text-sm text-muted-foreground hover:text-foreground">
          <span className="mr-2">
            {isDetailsOpen ? 'Hide Details' : `View All Categories (${data.length})`}
          </span>
          {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-2 mt-2">
          <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((entry, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05,
            duration: 0.2
          }} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200 border border-muted/30">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
              backgroundColor: entry.color
            }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate">
                      {entry.name}
                    </span>
                    {index === 0 && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        #1
                      </span>}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {entry.percent.toFixed(1)}%
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {formatCurrency(entry.value, currencyCode)}
                    </span>
                  </div>
                </div>
              </motion.div>)}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>;
}