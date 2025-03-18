
import { Button } from "@/components/ui/button";
import { Download, Plus, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BudgetHeaderProps {
  onAddBudget: () => void;
  onExport: () => void;
}

export const BudgetHeader = ({ onAddBudget, onExport }: BudgetHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className={`${isMobile ? "px-4 py-3" : "flex justify-between items-center"} mb-4`}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Budget</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Plan and track your spending limits
        </p>
      </div>
      {isMobile ? (
        <div className="mt-3 flex justify-between items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            size="sm"
            className="flex-1 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="flex-1 shadow-md hover:shadow-lg transition-all duration-200"
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
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={onAddBudget}
            className="shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
      )}
    </header>
  );
};
