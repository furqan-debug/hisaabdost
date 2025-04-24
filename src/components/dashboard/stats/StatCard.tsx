
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtext?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  children,
  className = "" 
}: StatCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${className}`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
        <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{title}</CardTitle>
        <Icon className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
      </CardHeader>
      <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
          {value}
        </div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        {children}
      </CardContent>
    </Card>
  );
};
