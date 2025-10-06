
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  PageHeader, 
  PageHeaderTitle, 
  PageHeaderDescription, 
  PageHeaderActions 
} from "@/components/ui/page-header";

interface BudgetHeaderProps {
  onAddBudget: () => void;
  onExport: () => void;
}

export const BudgetHeader = ({ onAddBudget, onExport }: BudgetHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
      <PageHeader variant="simple">
        <PageHeaderTitle gradient>My Budget</PageHeaderTitle>
        <PageHeaderDescription>
          Track and manage your monthly spending plan.
        </PageHeaderDescription>
      </PageHeader>
      
      <PageHeaderActions>
        <Button 
          variant="outline" 
          onClick={onExport}
          className="flex-1 sm:flex-none h-10"
          size={isMobile ? "sm" : "default"}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button 
          onClick={onAddBudget}
          className="flex-1 sm:flex-none h-10"
          size={isMobile ? "sm" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </PageHeaderActions>
    </div>
  );
};
