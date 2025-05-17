
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
    <Card className={`bg-card/95 backdrop-blur-md border-border/30 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardContent className="pt-6 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        
        {subtext && (
          <div className="mt-1">
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
