
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesPieChart } from "@/components/analytics/ExpensesPieChart";
import { motion } from "framer-motion";

interface OverviewCardProps {
  expenses: any[];
}

export function OverviewCard({ expenses }: OverviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
            <span className="text-2xl">📊</span>
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {expenses.length > 0 ? (
            <ExpensesPieChart expenses={expenses} />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-muted-foreground">No expenses to display</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
