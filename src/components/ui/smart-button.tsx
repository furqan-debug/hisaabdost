import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartButtonProps extends ButtonProps {
  loading?: boolean;
  disabledReason?: string;
  loadingText?: string;
}

export function SmartButton({
  children,
  disabled,
  loading = false,
  disabledReason,
  loadingText,
  className,
  ...props
}: SmartButtonProps) {
  const isDisabled = disabled || loading;
  
  const buttonContent = (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn(className)}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );

  if (isDisabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
}