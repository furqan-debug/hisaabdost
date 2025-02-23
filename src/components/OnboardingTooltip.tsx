
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnboardingTooltipProps {
  children: React.ReactNode;
  content: string;
  open?: boolean;
  defaultOpen?: boolean;
}

export function OnboardingTooltip({ children, content, open, defaultOpen }: OnboardingTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip open={open} defaultOpen={defaultOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
