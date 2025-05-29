import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Info } from "lucide-react";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  subtext?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  actionElement?: React.ReactNode;
  infoTooltip?: string;
}
export const StatCard = ({
  title,
  value,
  icon: Icon,
  subtext,
  children,
  className = "",
  actionElement,
  infoTooltip
}: StatCardProps) => {
  const isMobile = useIsMobile();
  return <Card className={`transition-all duration-300 hover:shadow-md h-full ${className}`}>
      <CardContent className="pt-6 pb-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-medium text-muted-foreground px-[4px] my-[6px]">{title}</h3>
          {infoTooltip && <Popover>
              <PopoverTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed px-0 mx-[14px]">
                    {infoTooltip}
                  </p>
                </div>
              </PopoverContent>
            </Popover>}
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
    </Card>;
};