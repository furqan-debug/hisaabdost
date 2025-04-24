
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface MonthCardsProps {
  currentMonthStart: Date;
  lastMonthStart: Date;
}

export function MonthCards({ currentMonthStart, lastMonthStart }: MonthCardsProps) {
  return (
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
  );
}
