"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { EyeIcon, PillIcon, SearchIcon } from "lucide-react";

import { PrintButton } from "@/components/dashboard/prescriptions/print-button";
import { PaginationControls } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { PrescriptionListResult } from "@/features/prescriptions/types";

type PrescriptionsWorkspaceProps = {
  initialData: PrescriptionListResult;
  search?: string;
};

export function PrescriptionsWorkspace({
  initialData,
  search = "",
}: PrescriptionsWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateQuery = useCallback(
    (next: { page?: number; search?: string }) => {
      const params = new URLSearchParams();
      const page = next.page ?? initialData.pagination.page;
      const q = next.search ?? search;
      if (page > 1) params.set("page", String(page));
      if (q) params.set("search", q);
      const query = params.toString();
      startTransition(() => {
        router.replace(
          `${ROUTES.DASHBOARD.PRESCRIPTIONS}${query ? `?${query}` : ""}`,
        );
      });
    },
    [initialData.pagination.page, router, search],
  );

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateQuery({
            page: 1,
            search: String(formData.get("search") ?? "").trim(),
          });
        }}
      >
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search by patient, Rx number, or diagnosis"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" disabled={isPending}>
          Search
        </Button>
      </form>

      {initialData.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] px-6 py-12 text-center text-sm text-muted-foreground">
          <PillIcon className="mx-auto mb-3 size-8 text-brand-blue/60" />
          No prescriptions yet. Create one from a completed appointment.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[#E5E7EB]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Rx #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Diagnosis
                  </TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.prescriptionNumber}
                    </TableCell>
                    <TableCell>{item.patientName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.doctorName}
                    </TableCell>
                    <TableCell className="hidden max-w-[14rem] truncate lg:table-cell">
                      {item.diagnosis ?? "—"}
                    </TableCell>
                    <TableCell>{item.issuedDateLabel}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link
                              href={
                                item.appointmentId
                                  ? `${ROUTES.DASHBOARD.PRESCRIPTIONS}?appointmentId=${item.appointmentId}`
                                  : `${ROUTES.DASHBOARD.PRESCRIPTIONS}/${item.id}`
                              }
                            />
                          }
                        >
                          <EyeIcon className="size-4" />
                          View
                        </Button>
                        <PrintButton prescriptionId={item.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={initialData.pagination.page}
            pageSize={initialData.pagination.limit}
            totalItems={initialData.pagination.total}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      )}
    </div>
  );
}
