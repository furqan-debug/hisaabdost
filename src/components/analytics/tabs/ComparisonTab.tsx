
import { Card, CardContent } from "@/components/ui/card";
import { ExpensesComparison } from "../ExpensesComparison";

interface ComparisonTabProps {
  expenses: any[];
}

export function ComparisonTab({ expenses }: ComparisonTabProps) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="px-0 pt-0">
        <ExpensesComparison expenses={expenses} />
      </CardContent>
    </Card>
  );
}
