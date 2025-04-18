import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
interface BudgetHeaderProps {
  onAddBudget: () => void;
  onExport: () => void;
}
export const BudgetHeader = ({
  onAddBudget,
  onExport
}: BudgetHeaderProps) => {
  const isMobile = useIsMobile();
  return <header className={cn("space-y-3 mb-4", isMobile ? "px-1" : "flex justify-between items-center space-y-0")}>
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Budget
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm">
          Manage and track your budget allocations
        </p>
      </div>
      {isMobile ? <div className="flex justify-between items-center gap-2">
          <Button variant="outline" onClick={onExport} size="sm" className="flex-1 text-xs h-auto rounded-lg my-0 py-[9px] px-0 mx-[9px]">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button size="sm" onClick={onAddBudget} className="flex-1 rounded-lg text-xs h-auto py-[9px] mx-[10px] px-0 text-center">
            <Plus className="h-3 w-3 mr-1" />
            Add Budget
          </Button>
        </div> : <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExport} className="rounded-lg">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddBudget} className="rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>}
    </header>;
};