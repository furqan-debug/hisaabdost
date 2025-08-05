
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesPieChart } from "../ExpensesPieChart";

interface OverviewTabProps {
  expenses: any[];
  config: Record<string, {
    color: string;
  }>;
}

export function OverviewTab({ expenses, config }: OverviewTabProps) {
  return (
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-center">
          Category Breakdown
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center">
          Detailed view of your spending by category
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
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
  );
}
