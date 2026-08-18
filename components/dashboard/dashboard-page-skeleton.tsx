import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic dashboard module placeholder — used by `dashboard/loading.tsx`
 * while the target Server Component fetches.
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg sm:h-9" />
        <Skeleton className="h-4 w-full max-w-md rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
          <CardHeader>
            <Skeleton className="h-5 w-32 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
