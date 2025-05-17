
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  subtext?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  actionElement?: React.ReactNode;
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  subtext, 
  children,
  className = "",
  actionElement
}: StatCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className={`bg-card/95 backdrop-blur-md border-border/30 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-1 mb-1">
          {icon && <span>{icon}</span>}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        
        <div className="text-2xl md:text-3xl font-bold mt-1">{value}</div>
        
        {subtext && (
          <div className="mt-2">
            {subtext}
          </div>
        )}
        
        {children}
        
        {actionElement && (
          <div className="mt-3">
            {actionElement}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
