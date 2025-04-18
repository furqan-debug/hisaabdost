
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils";

type AspectRatioProps = React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> & {
  className?: string;
};

const AspectRatio = ({ className, ...props }: AspectRatioProps) => (
  <AspectRatioPrimitive.Root
    className={cn("relative w-full overflow-hidden", className)}
    {...props}
  />
);

AspectRatio.displayName = "AspectRatio";

export { AspectRatio }
