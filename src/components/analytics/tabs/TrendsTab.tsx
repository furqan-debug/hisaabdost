
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

export function TrendsTab({ expenses, config }: TrendsTabProps) {
  if (expenses.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-muted-foreground">Add expenses to see spending trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-center">
            Monthly Trends
          </CardTitle>
          <CardDescription className="text-center">Your spending patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="h-[300px] w-full">
            <ChartContainer config={config}>
              <ExpensesBarChart expenses={expenses} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-center">
            Category Trends
          </CardTitle>
          <CardDescription className="text-center">How your spending evolves by category</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="h-[300px] w-full">
            <ChartContainer config={config}>
              <ExpensesLineChart expenses={expenses} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
