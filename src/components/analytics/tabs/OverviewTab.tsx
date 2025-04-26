
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
    <Card className="border-0 shadow-sm bg-card/80 py-[12px] my-[21px]">
      <CardHeader className="pb-2 py-[9px] my-[11px]">
        <CardTitle className="text-lg font-medium">Category Breakdown</CardTitle>
        <CardDescription>Your expenses by category</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-6 px-0 mx-0 my-[30px] py-[17px]">
        <ChartContainer config={config} className="pie-chart-container">
          <ExpensesPieChart expenses={expenses} />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
