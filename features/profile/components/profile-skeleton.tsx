"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder matching the profile workspace layout.
 */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-md rounded-lg" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-56 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-5 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
