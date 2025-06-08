
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BudgetHeaderProps {
  onAddBudget: () => void;
  onExport: () => void;
}

export const BudgetHeader = ({ onAddBudget, onExport }: BudgetHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-green-600">
          Budget
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage and track your budget allocations
        </p>
      </div>
      
      <div className="flex items-center gap-3">
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
          className="flex-1 sm:flex-none h-10 bg-green-600 hover:bg-green-700"
          size={isMobile ? "sm" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>
    </div>
  );
};
