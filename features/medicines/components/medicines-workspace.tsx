"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  ListToolbar,
  PaginationControls,
  SearchInput,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MEDICINE_STATUSES } from "@/constants/statuses";
import {
  archiveMedicineAction,
  createMedicineAction,
  restoreMedicineAction,
  updateMedicineAction,
} from "@/features/medicines/actions";
import { MedicineFormDialog } from "@/features/medicines/components/medicine-form-dialog";
import { MedicinesTable } from "@/features/medicines/components/medicines-table";
import type {
  MedicineListItem,
  MedicineListResult,
} from "@/features/medicines/types";
import { createMedicineActionSchema } from "@/validators/medicine";

type MedicineFormValues = z.infer<typeof createMedicineActionSchema>;

type MedicinesWorkspaceProps = {
  initialData: MedicineListResult;
};

export function MedicinesWorkspace({ initialData }: MedicinesWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineListItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<MedicineListItem | null>(
    null,
  );
  const [pending, setPending] = useState(false);

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
        if (
          value === null ||
          value === "" ||
          (key !== "page" && value === "all")
        ) {
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

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: MedicineListItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  async function handleSubmit(values: MedicineFormValues) {
    setPending(true);
    try {
      if (editing) {
        const result = await updateMedicineAction({
          id: editing.id,
          data: values,
        });
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        toast.success("Medicine updated.");
      } else {
        const result = await createMedicineAction(values);
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        toast.success("Medicine added to the library.");
      }
      setDialogOpen(false);
      setEditing(null);
      refresh();
    } finally {
      setPending(false);
    }
  }

  async function confirmArchive() {
    if (!archiveTarget) return;
    setPending(true);
    try {
      const result = await archiveMedicineAction({ id: archiveTarget.id });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Medicine archived.");
      setArchiveTarget(null);
      refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleRestore(item: MedicineListItem) {
    setPending(true);
    try {
      const result = await restoreMedicineAction({ id: item.id });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Medicine restored.");
      refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-col gap-3 border-b border-[#E5E7EB] sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              Medicine Library
            </CardTitle>
            <CardDescription>
              Maintain commonly used medicines and their default prescription
              instructions. Archived medicines stay on historical prescriptions
              but disappear from new ones.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue/90 sm:w-auto"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            Add Medicine
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <ListToolbar
            start={
              <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search name or generic name…"
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
                    <SelectItem value={MEDICINE_STATUSES.ACTIVE}>
                      Active
                    </SelectItem>
                    <SelectItem value={MEDICINE_STATUSES.ARCHIVED}>
                      Archived
                    </SelectItem>
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
          <MedicinesTable
            items={initialData.items}
            onEdit={openEdit}
            onArchive={setArchiveTarget}
            onRestore={handleRestore}
          />
        </div>
      </div>

      <PaginationControls
        page={initialData.pagination.page}
        pageSize={initialData.pagination.limit}
        totalItems={initialData.pagination.total}
        onPageChange={(page) => updateParams({ page: String(page) })}
      />

      <MedicineFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
        pending={pending}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={archiveTarget != null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              It will no longer appear in new prescriptions. Existing
              prescriptions keep their original snapshot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={confirmArchive}
              disabled={pending}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
