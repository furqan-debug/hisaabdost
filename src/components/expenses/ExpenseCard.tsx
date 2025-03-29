
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { formatDate } from "@/utils/formatters";

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
    <Card className="overflow-hidden hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`w-2 self-stretch ${getCategoryColor()}`} />
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-sm line-clamp-1">{description}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
              </div>
              <span className="font-semibold text-sm">{formatCurrency(amount)}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Tag className="h-3 w-3" />
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
