
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
    <Card className={`transition-all duration-300 hover:shadow-md h-full ${className}`}>
      <CardContent className="pt-6 pb-4 flex flex-col h-full">
        <h3 className="text-md font-medium text-muted-foreground mb-2">{title}</h3>
        <div className="text-3xl font-bold mb-2">
          {value}
        </div>
        {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
        {children}
        
        <div className="mt-auto pt-2">
          {actionElement}
        </div>
      </CardContent>
    </Card>
  );
};
