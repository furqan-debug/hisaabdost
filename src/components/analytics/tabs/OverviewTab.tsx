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
  return <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Category Breakdown
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Detailed view of your spending by category
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-6 py-[10px]">
        <ChartContainer config={config} className="h-auto min-h-[450px] w-full">
          <ExpensesPieChart expenses={expenses} />
        </ChartContainer>
      </CardContent>
    </Card>;
}