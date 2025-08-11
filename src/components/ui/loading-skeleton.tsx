import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "list" | "text" | "circle" | "stat";
  count?: number;
}

export function LoadingSkeleton({ 
  className, 
  variant = "card", 
  count = 1 
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {skeletons.map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
              <div className="h-6 bg-muted rounded animate-pulse w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {skeletons.map((i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
            <div className="h-4 bg-muted rounded animate-pulse w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "stat") {
    return (
      <div className={cn("rounded-lg border p-4 space-y-2", className)}>
        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div className={cn("", className)}>
        {skeletons.map((i) => (
          <div key={i} className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  // Default text variant
  return (
    <div className={cn("space-y-2", className)}>
      {skeletons.map((i) => (
        <div key={i} className="h-4 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );
}

// Specialized skeleton components for common use cases
export function BudgetCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded bg-muted animate-pulse" />
          <div className="h-5 bg-muted rounded animate-pulse w-24" />
        </div>
        <div className="h-4 bg-muted rounded animate-pulse w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 bg-muted rounded animate-pulse w-20" />
          <div className="h-3 bg-muted rounded animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
}

export function ExpenseListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
          <div className="text-right space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
            <div className="h-3 bg-muted rounded animate-pulse w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 rounded bg-muted animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-20" />
      </div>
      <div className="h-8 bg-muted rounded animate-pulse w-24" />
      <div className="h-3 bg-muted rounded animate-pulse w-16" />
    </div>
  );
}