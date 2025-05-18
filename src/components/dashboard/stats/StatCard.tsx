
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtext?: React.ReactNode; // Updated to accept React elements
  icon?: React.ReactNode;
  className?: string;
  actionElement?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  subtext,
  icon,
  className,
  actionElement,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className="mt-2 font-semibold">{value}</div>
        {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
        {actionElement && <div className="mt-2">{actionElement}</div>}
      </CardContent>
    </Card>
  );
}
