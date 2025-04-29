
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesPieChart } from "../ExpensesPieChart";
import { ChartContainer } from "@/components/ui/chart";

interface OverviewTabProps {
  expenses: any[];
  config: Record<string, {
    color: string;
  }>;
}

export function OverviewTab({
  expenses,
  config
}: OverviewTabProps) {
  return (
    <Card className="border-0 shadow-sm bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Category Breakdown</CardTitle>
        <CardDescription>Your expenses by category</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-12">
        <ChartContainer config={config} className="pie-chart-container h-[420px]">
          <ExpensesPieChart expenses={expenses} />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
