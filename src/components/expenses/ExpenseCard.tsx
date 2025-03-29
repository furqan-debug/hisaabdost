
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/chartUtils";
import { Expense } from "./types";
import { CalendarIcon, CreditCard, Tag } from "lucide-react";
import { formatDate } from "@/utils/chartUtils";

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`w-2 self-stretch bg-${getCategoryColor(expense.category)}-500`} />
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{expense.description}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>
              <span className="font-semibold">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center text-xs bg-muted px-2 py-0.5 rounded">
                  <Tag className="h-3 w-3 mr-1" />
                  {expense.category}
                </span>
                {expense.paymentMethod && (
                  <span className="inline-flex items-center text-xs bg-muted px-2 py-0.5 rounded">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {expense.paymentMethod}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get a color based on category
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    "Food": "green",
    "Transport": "blue",
    "Entertainment": "purple",
    "Shopping": "pink",
    "Housing": "orange",
    "Utilities": "yellow",
    "Healthcare": "red",
    "Personal": "indigo",
    "Education": "cyan",
    "Travel": "amber",
    "Other": "gray"
  };
  
  return colorMap[category] || "gray";
}
