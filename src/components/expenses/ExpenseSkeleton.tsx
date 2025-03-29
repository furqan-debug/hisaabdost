
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ExpenseSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className="w-2 self-stretch bg-gray-200" />
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
