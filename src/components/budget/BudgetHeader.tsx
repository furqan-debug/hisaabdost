
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
    <header className={isMobile ? "px-4 py-2" : "flex justify-between items-center"}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">Budget</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage and track your budget allocations
        </p>
      </div>
      {isMobile ? (
        <div className="mt-3 flex justify-between items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            size="sm"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={onAddBudget}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddBudget}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
      )}
    </header>
  );
};
