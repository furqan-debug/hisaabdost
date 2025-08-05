
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesComparison } from "../ExpensesComparison";

interface ComparisonTabProps {
  expenses: any[];
}

export function ComparisonTab({ expenses }: ComparisonTabProps) {
  return (
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Period Comparison
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Compare your spending across different time periods
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {expenses.length > 0 ? (
          <ExpensesComparison expenses={expenses} />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚖️</div>
            <p className="text-muted-foreground">Add expenses to compare periods</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
