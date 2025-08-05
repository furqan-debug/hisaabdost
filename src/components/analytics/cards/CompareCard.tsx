
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesComparison } from "@/components/analytics/ExpensesComparison";
import { motion } from "framer-motion";

interface CompareCardProps {
  expenses: any[];
}

export function CompareCard({ expenses }: CompareCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
            <span className="text-2xl">⚖️</span>
            Compare
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {expenses.length > 0 ? (
            <>
              <ExpensesComparison expenses={expenses} />
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  📊 See how your spending compares month-to-month
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚖️</div>
              <p className="text-muted-foreground">Add expenses to compare periods</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
