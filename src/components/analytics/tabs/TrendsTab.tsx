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
      <Card className="border-0 shadow-sm bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-center">Monthly Trends</CardTitle>
          <CardDescription className="text-center">Your spending patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4 my-0 py-px">
          <div className="h-[280px] w-full my-0 py-[102px]">
            <ChartContainer config={config}>
              <ExpensesBarChart expenses={expenses} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-center">Category Trends</CardTitle>
          <CardDescription className="text-center">How your spending evolves by category</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="h-[280px] w-full">
            <ChartContainer config={config}>
              <ExpensesLineChart expenses={expenses} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </>;
}