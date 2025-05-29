
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, Sparkles, Wallet, TrendingUp, DollarSign, PiggyBank, X } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface InfoPopoverProps {
  title: string;
  content: string;
  cardType?: 'wallet' | 'expenses' | 'income' | 'savings';
  children: React.ReactNode;
}

const cardIcons: Record<string, LucideIcon> = {
  wallet: Wallet,
  expenses: TrendingUp,
  income: DollarSign,
  savings: PiggyBank
};

const cardColors: Record<string, string> = {
  wallet: "text-blue-500",
  expenses: "text-red-500", 
  income: "text-green-500",
  savings: "text-purple-500"
};

export const InfoPopover = ({ title, content, cardType = 'wallet', children }: InfoPopoverProps) => {
  const IconComponent = cardIcons[cardType];
  const iconColor = cardColors[cardType];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }}
        align="center"
        side="top"
        sideOffset={0}
        avoidCollisions={false}
      >
        <div className="relative p-5 rounded-lg">
          {/* Decorative sparkles */}
          <div className="absolute top-2 right-2">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
          
          {/* Header with icon */}
          <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-full bg-muted/30 ${iconColor}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-base text-foreground mb-1">
                {title}
              </h4>
              <div className="h-px bg-gradient-to-r from-primary/20 to-transparent" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
            
            {/* Friendly tip */}
            <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="h-2 w-2 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                💡 <span className="font-medium">Tip:</span> This information updates in real-time as you add or modify your financial data!
              </p>
            </div>
          </div>
          
          {/* Bottom decoration */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
