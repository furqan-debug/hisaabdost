
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
    <Card className={`transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full border-border/50 hover:border-primary/20 ${className}`}>
      <CardContent className="pt-4 pb-3 px-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          {infoTooltip && (
            <InfoPopover
              title={title}
              content={infoTooltip}
              cardType={cardType}
            >
              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </InfoPopover>
          )}
        </div>
        <div className="text-2xl font-bold mb-1.5 text-foreground">
          {value}
        </div>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        {children}
        
        <div className="mt-auto pt-1.5">
          {actionElement}
        </div>
      </CardContent>
    </Card>
  );
};
