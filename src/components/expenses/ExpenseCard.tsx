
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency-context";

interface ExpenseCardProps {
  description: string;
  amount: number;
  date: string;
  category: string;
  onClick?: () => void;
}

export function ExpenseCard({ 
  description, 
  amount, 
  date, 
  category, 
  onClick 
}: ExpenseCardProps) {
  const isMobile = useIsMobile();
  const { currencySymbol } = useCurrency();
  
  // Get category color based on category name
  const getCategoryColor = () => {
    switch (category.toLowerCase()) {
      case 'food': return 'bg-green-500';
      case 'transportation': return 'bg-blue-500';
      case 'housing': return 'bg-purple-500';
      case 'utilities': return 'bg-yellow-500';
      case 'entertainment': return 'bg-pink-500';
      case 'healthcare': return 'bg-red-500';
      case 'personal': return 'bg-indigo-500';
      case 'education': return 'bg-cyan-500';
      case 'shopping': return 'bg-amber-500';
      case 'other': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow",
        isMobile ? "my-2" : ""
      )} 
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`w-1.5 self-stretch ${getCategoryColor()}`} />
          <div className={cn(
            "flex-1 p-4", 
            isMobile ? "py-3 px-3" : ""
          )}>
            <div className="flex justify-between items-start mb-2">
              <div className={isMobile ? "max-w-[70%]" : ""}>
                <h3 className={cn(
                  "font-medium line-clamp-1",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {description}
                </h3>
                <p className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-[10px]" : "text-xs"
                )}>
                  {formatDate(date)}
                </p>
              </div>
              <span className={cn(
                "font-semibold",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {formatCurrency(amount, currencySymbol)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1",
                  isMobile ? "text-[10px] py-0.5 px-1.5" : "text-xs"
                )}
              >
                <Tag className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
