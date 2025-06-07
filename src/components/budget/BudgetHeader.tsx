
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
          className="flex-1 sm:flex-none"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button 
          onClick={onAddBudget}
          className="flex-1 sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>
    </div>
  );
};
