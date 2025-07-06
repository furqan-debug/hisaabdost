
import { groupSimilarExpenses, getTopSpenders, analyzeSpendingPatterns } from "@/utils/expenseGrouping";
import { WastageAlerts } from "../WastageAlerts";
import { SmartInsights } from "../SmartInsights";
import { OverviewCards } from "../summary/OverviewCards";
import { SmartExpenseGroups } from "../summary/SmartExpenseGroups";
import { TopIndividualExpenses } from "../summary/TopIndividualExpenses";
import { SpendingPatternsAnalysis } from "../summary/SpendingPatternsAnalysis";
import { UngroupedExpenses } from "../summary/UngroupedExpenses";

interface SummaryTabProps {
  expenses: any[];
}

export function SummaryTab({ expenses }: SummaryTabProps) {
  const groupingResult = groupSimilarExpenses(expenses);
  const topSpenders = getTopSpenders(expenses, 5);
  const spendingPatterns = analyzeSpendingPatterns(expenses);
  
  const totalSpending = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
            <div className="text-4xl">📊</div>
          </div>
          <h3 className="text-xl font-semibold mb-3">No Data to Analyze</h3>
          <p className="text-muted-foreground mb-6">
            Add some expenses to see intelligent insights about your spending patterns and behaviors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OverviewCards 
        groupsCount={groupingResult.groups.length}
        totalGrouped={groupingResult.totalGrouped}
        patternsCount={spendingPatterns.length}
        totalSpending={totalSpending}
      />

      <WastageAlerts expenses={expenses} />

      <SmartInsights expenses={expenses} totalSpending={totalSpending} />

      <SmartExpenseGroups 
        groups={groupingResult.groups} 
        totalSpending={totalSpending} 
      />

      <TopIndividualExpenses topSpenders={topSpenders} />

      <SpendingPatternsAnalysis 
        spendingPatterns={spendingPatterns} 
        totalSpending={totalSpending} 
      />

      {groupingResult.ungrouped.length > 0 && (
        <UngroupedExpenses ungroupedExpenses={groupingResult.ungrouped} />
      )}
    </div>
  );
}
