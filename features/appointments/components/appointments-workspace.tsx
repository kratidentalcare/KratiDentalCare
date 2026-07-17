"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { AppointmentsTable } from "@/features/appointments/components/appointments-table";
import type { AppointmentListResult } from "@/features/appointments/types";
import { ADMIN_APPOINTMENT_STATUS_FILTER_VALUES } from "@/constants/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AppointmentsWorkspaceProps = {
  initialData: AppointmentListResult;
};

export function AppointmentsWorkspace({
  initialData,
}: AppointmentsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, startRefresh] = useTransition();

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      date: searchParams.get("date") ?? "",
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const refresh = useCallback(() => {
    startRefresh(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
          <CardDescription>
            Search patients, filter by status or date.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, phone, email, reason…"
              defaultValue={filters.search}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParams({
                    search: event.currentTarget.value,
                    page: "1",
                  });
                }
              }}
            />
          </div>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateParams({
                status: value === "all" ? null : value,
                page: "1",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ADMIN_APPOINTMENT_STATUS_FILTER_VALUES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePickerField
            value={filters.date}
            onChange={(value) =>
              updateParams({ date: value || null, page: "1" })
            }
            placeholder="Filter by date"
          />
        </CardContent>
      </Card>

      <div className="relative">
        {isRefreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
            <Loader2Icon className="size-6 animate-spin text-brand-blue" />
          </div>
        ) : null}
        <AppointmentsTable items={initialData.items} onRefresh={refresh} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page {initialData.pagination.page} of{" "}
          {initialData.pagination.totalPages} · {initialData.pagination.total}{" "}
          total
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!initialData.pagination.hasPreviousPage}
            onClick={() =>
              updateParams({
                page: String(initialData.pagination.page - 1),
              })
            }
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!initialData.pagination.hasNextPage}
            onClick={() =>
              updateParams({ page: String(initialData.pagination.page + 1) })
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
