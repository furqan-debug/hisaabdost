
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  subtext?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  actionElement?: React.ReactNode;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  children,
  className = "",
  actionElement
}: StatCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${className}`}>
      <CardContent className="pt-4 pb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-2xl font-semibold">{value}</div>
          {subtext && <div className="text-xs">{subtext}</div>}
          {children}
        </div>
        
        {actionElement && (
          <div className="mt-2">
            {actionElement}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
