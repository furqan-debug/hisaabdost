
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Info, Wallet, Receipt, Coins, Percent } from "lucide-react";
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

const getCardIcon = (cardType: string) => {
  switch (cardType) {
    case 'wallet':
      return Wallet;
    case 'expenses':
      return Receipt;
    case 'income':
      return Coins;
    case 'savings':
      return Percent;
    default:
      return Wallet;
  }
};

const getCardStyles = (cardType: string) => {
  switch (cardType) {
    case 'wallet':
      return {
        gradient: "bg-white dark:bg-card",
        iconColor: "text-primary",
        border: "border-border"
      };
    case 'expenses':
      return {
        gradient: "bg-white dark:bg-card",
        iconColor: "text-destructive",
        border: "border-border"
      };
    case 'income':
      return {
        gradient: "bg-white dark:bg-card",
        iconColor: "text-success dark:text-success",
        border: "border-border"
      };
    case 'savings':
      return {
        gradient: "bg-white dark:bg-card",
        iconColor: "text-primary",
        border: "border-border"
      };
    default:
      return {
        gradient: "bg-white dark:bg-card",
        iconColor: "text-primary",
        border: "border-border"
      };
  }
};

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
  const CardIcon = Icon || getCardIcon(cardType);
  const styles = getCardStyles(cardType);
  
  return (
    <Card className={`transition-all duration-300 hover:shadow-xl aspect-square ${styles.gradient} ${styles.border} shadow-sm ${className}`}>
      <CardContent className="p-3 flex flex-col h-full relative">
        {/* Info button - positioned absolutely in top right */}
        {infoTooltip && (
          <div className="absolute top-2 right-2 z-10">
            <InfoPopover
              title={title}
              content={infoTooltip}
              cardType={cardType}
            >
              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </InfoPopover>
          </div>
        )}
        
        {/* Main content - centered and properly spaced */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
          {/* Large centered icon */}
          <div className="mb-2">
            <CardIcon className={`h-8 w-8 ${styles.iconColor}`} />
          </div>
          
          {/* Title */}
          <h3 className="text-xs font-medium text-muted-foreground mb-1 leading-tight">
            {title}
          </h3>
          
          {/* Value */}
          <div className="text-lg font-bold mb-1 leading-tight px-1">
            {value}
          </div>
          
          {/* Subtext */}
          {subtext && (
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">
              {subtext}
            </div>
          )}
          
          {children}
        </div>
        
        {/* Action element - at bottom with proper spacing */}
        {actionElement && (
          <div className="mt-1">
            {actionElement}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
