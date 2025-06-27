
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

  return (
    <div className="space-y-6">
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

      <UngroupedExpenses ungroupedExpenses={groupingResult.ungrouped} />
    </div>
  );
}
