
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesBarChart } from "../ExpensesBarChart";
import { ExpensesLineChart } from "../ExpensesLineChart";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { processMonthlyData } from "@/utils/chartUtils";
import { useAllCategories } from "@/hooks/useAllCategories";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface TrendsTabProps {
  expenses: any[];
  config: Record<string, {
    color: string;
  }>;
}

export function TrendsTab({ expenses, config }: TrendsTabProps) {
  const [monthlyDetailsOpen, setMonthlyDetailsOpen] = useState(false);
  const [categoryDetailsOpen, setCategoryDetailsOpen] = useState(false);
  const { categories } = useAllCategories();
  const { currencyCode } = useCurrency();
  
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

  const data = processMonthlyData(expenses, categories.map(cat => cat.value));
  const allCategoriesWithData = categories
    .filter(cat => data.some(item => item[cat.value] > 0))
    .map(cat => cat.value);

  const DetailBreakdown = ({ data, categories }: { data: any[], categories: string[] }) => (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground">Detailed Breakdown</h4>
      <div className="grid gap-3">
        {data.map((monthData, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <h5 className="font-medium text-sm">{monthData.month}</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories
                .filter(category => monthData[category] > 0)
                .sort((a, b) => monthData[b] - monthData[a])
                .map(category => (
                  <div key={category} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-medium">{formatCurrency(monthData[category], currencyCode)}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-center">
            Monthly Trends
          </CardTitle>
          <CardDescription className="text-center">Your spending patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ChartContainer config={config}>
            <ExpensesBarChart expenses={expenses} />
          </ChartContainer>
          
          <Collapsible open={monthlyDetailsOpen} onOpenChange={setMonthlyDetailsOpen}>
            <div className="flex justify-center mt-4">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {monthlyDetailsOpen ? (
                    <>
                      Hide Details
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show Details
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DetailBreakdown data={data} categories={allCategoriesWithData} />
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
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
          <ChartContainer config={config}>
            <ExpensesLineChart expenses={expenses} />
          </ChartContainer>
          
          <Collapsible open={categoryDetailsOpen} onOpenChange={setCategoryDetailsOpen}>
            <div className="flex justify-center mt-4">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {categoryDetailsOpen ? (
                    <>
                      Hide Details
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show Details
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DetailBreakdown data={data} categories={allCategoriesWithData} />
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
