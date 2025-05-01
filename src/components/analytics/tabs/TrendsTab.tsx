import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesBarChart } from "../ExpensesBarChart";
import { ExpensesLineChart } from "../ExpensesLineChart";
import { ChartContainer } from "@/components/ui/chart";
interface TrendsTabProps {
  expenses: any[];
  config: Record<string, {
    color: string;
  }>;
}
export function TrendsTab({
  expenses,
  config
}: TrendsTabProps) {
  return <>
      <Card className="border-0 shadow-sm bg-card/80 trends-card py-[8px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-center">Monthly Trends</CardTitle>
          <CardDescription className="text-center">Your spending patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-2 trends-chart-container my-[6px]">
          <div className="h-[220px] mx--4 my-[6px] py-[26px]">
            <ChartContainer config={config}>
              <ExpensesBarChart expenses={expenses} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card/80 trends-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-center">Category Trends</CardTitle>
          <CardDescription className="text-center">How your spending evolves by category</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-2 trends-chart-container py-[11px] my-[40px]">
          <div className="h-[220px] my-[8px] py-[31px]">
            <ChartContainer config={config}>
              <ExpensesLineChart expenses={expenses} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </>;
}