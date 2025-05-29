
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Info } from "lucide-react";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { InfoPopover } from "./InfoPopover";

interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  subtext?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  actionElement?: React.ReactNode;
  infoTooltip?: string;
  cardType?: 'wallet' | 'expenses' | 'income' | 'savings';
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  children,
  className = "",
  actionElement,
  infoTooltip,
  cardType = 'wallet'
}: StatCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className={`transition-all duration-300 hover:shadow-md h-full ${className}`}>
      <CardContent className="pt-6 pb-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-medium text-muted-foreground">{title}</h3>
          {infoTooltip && (
            <InfoPopover 
              title={title} 
              content={infoTooltip} 
              cardType={cardType}
            >
              <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95" />
            </InfoPopover>
          )}
        </div>
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
