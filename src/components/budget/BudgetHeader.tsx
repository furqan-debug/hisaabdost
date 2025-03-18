
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface BudgetHeaderProps {
  onAddBudget: () => void;
  onExport: () => void;
}

export const BudgetHeader = ({ onAddBudget, onExport }: BudgetHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className={cn(
      "space-y-3 mb-4",
      isMobile ? "px-2" : "flex justify-between items-center space-y-0"
    )}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Budget
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage and track your budget allocations
        </p>
      </div>
      {isMobile ? (
        <div className="flex justify-between items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            size="sm"
            className="flex-1 rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="flex-1 rounded-lg"
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
            className="rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={onAddBudget}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
      )}
    </header>
  );
};
