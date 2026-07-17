"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { PatientEditContactDialog } from "@/features/patients/components/patient-edit-contact-dialog";
import { PatientStatusDialog } from "@/features/patients/components/patient-status-dialog";
import { PatientsTable } from "@/features/patients/components/patients-table";
import type { PatientListItem, PatientListResult } from "@/features/patients/types";
import {
  ListToolbar,
  PaginationControls,
  SearchInput,
} from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PatientsWorkspaceProps = {
  initialData: PatientListResult;
};

export function PatientsWorkspace({ initialData }: PatientsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [editingPatient, setEditingPatient] = useState<PatientListItem | null>(
    null,
  );
  const [statusPatient, setStatusPatient] = useState<PatientListItem | null>(
    null,
  );

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "all",
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          if (key === "status" && value === "all") {
            params.delete(key);
          } else if (value === null || value === "") {
            params.delete(key);
          } else {
            params.set(key, value);
          }
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
          <CardTitle className="text-base font-semibold">Patients</CardTitle>
          <CardDescription>
            Search by name, phone, or email. Patients are created automatically
            from appointment bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListToolbar
            start={
              <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search name, phone, or email…"
                  onValueChange={setSearchValue}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      updateParams({
                        search: searchValue.trim() || null,
                        page: "1",
                      });
                    }
                  }}
                  onClear={() => {
                    setSearchValue("");
                    updateParams({ search: null, page: "1" });
                  }}
                />
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <div className="relative rounded-xl ring-1 ring-[#E5E7EB]">
        {isRefreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
            <Loader2Icon className="size-6 animate-spin text-brand-blue" />
          </div>
        ) : null}
        <div className="p-3 sm:p-4">
          <PatientsTable
            items={initialData.items}
            onEdit={setEditingPatient}
            onToggleStatus={setStatusPatient}
          />
        </div>
      </div>

      <PaginationControls
        page={initialData.pagination.page}
        pageSize={initialData.pagination.limit}
        totalItems={initialData.pagination.total}
        onPageChange={(page) => updateParams({ page: String(page) })}
      />

      <PatientEditContactDialog
        patient={editingPatient}
        open={editingPatient !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPatient(null);
        }}
        onComplete={refresh}
      />

      {statusPatient ? (
        <PatientStatusDialog
          patientId={statusPatient.id}
          currentStatus={statusPatient.status}
          open={statusPatient !== null}
          onOpenChange={(open) => {
            if (!open) setStatusPatient(null);
          }}
          onComplete={refresh}
        />
      ) : null}
    </div>
  );
}
