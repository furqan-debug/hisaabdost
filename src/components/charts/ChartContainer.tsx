
import React from 'react';
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ children, className }: ChartContainerProps) {
  return (
    <div className={cn(
      "w-full min-h-[300px] h-full relative chart-wrapper",
      "p-2 md:p-4 rounded-xl bg-card/95 backdrop-blur-sm border border-border/50",
      className
    )}>
      {children}
    </div>
  );
}
