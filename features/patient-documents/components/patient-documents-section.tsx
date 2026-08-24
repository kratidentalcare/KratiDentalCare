"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileStackIcon, Loader2Icon, UploadIcon } from "lucide-react";

import {
  PATIENT_DOCUMENT_TYPE_LABELS,
  PATIENT_DOCUMENT_TYPE_VALUES,
  type PatientDocumentType,
} from "@/constants/patient-documents";
import { PatientDocumentDeleteDialog } from "@/features/patient-documents/components/patient-document-delete-dialog";
import { PatientDocumentUploadDialog } from "@/features/patient-documents/components/patient-document-upload-dialog";
import { PatientDocumentViewDialog } from "@/features/patient-documents/components/patient-document-view-dialog";
import { PatientDocumentsGrid } from "@/features/patient-documents/components/patient-documents-grid";
import type {
  PatientDocumentListItem,
  PatientDocumentListResult,
} from "@/features/patient-documents/types";
import { ROUTES } from "@/constants/routes";
import { PaginationControls, SearchInput } from "@/components/shared";
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

type PatientDocumentsSectionProps = {
  patientId: string;
  initialData: PatientDocumentListResult;
  initialSearch?: string;
  initialType?: PatientDocumentType | null;
};

export function PatientDocumentsSection({
  patientId,
  initialData,
  initialSearch = "",
  initialType = null,
}: PatientDocumentsSectionProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<PatientDocumentListItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<PatientDocumentListItem | null>(
    null,
  );

  const refresh = useCallback(() => {
    startRefresh(() => {
      router.refresh();
    });
  }, [router]);

  const updateParams = (updates: {
    docsPage?: number | null;
    docsQ?: string | null;
    docsType?: string | null;
  }) => {
    const params = new URLSearchParams(window.location.search);

    if (updates.docsPage !== undefined) {
      if (!updates.docsPage || updates.docsPage <= 1) {
        params.delete("docsPage");
      } else {
        params.set("docsPage", String(updates.docsPage));
      }
    }

    if (updates.docsQ !== undefined) {
      if (!updates.docsQ) {
        params.delete("docsQ");
      } else {
        params.set("docsQ", updates.docsQ);
      }
    }

    if (updates.docsType !== undefined) {
      if (!updates.docsType) {
        params.delete("docsType");
      } else {
        params.set("docsType", updates.docsType);
      }
    }

    const query = params.toString();
    router.replace(
      `${ROUTES.DASHBOARD.PATIENTS}/${patientId}${query ? `?${query}` : ""}`,
    );
  };

  return (
    <>
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileStackIcon className="size-4 text-brand-blue" />
              Patient Documents
            </CardTitle>
            <CardDescription>
              X-rays, scans, lab reports, and other medical files for this
              patient.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isRefreshing}
            onClick={() => setUploadOpen(true)}
          >
            <UploadIcon className="size-4" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <SearchInput
              value={searchValue}
              placeholder="Search documents…"
              onValueChange={setSearchValue}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParams({
                    docsQ: searchValue.trim() || null,
                    docsPage: 1,
                  });
                }
              }}
              onClear={() => {
                setSearchValue("");
                updateParams({ docsQ: null, docsPage: 1 });
              }}
            />
            <Select
              value={initialType ?? "all"}
              onValueChange={(value) => {
                if (!value) return;
                updateParams({
                  docsType: value === "all" ? null : value,
                  docsPage: 1,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {PATIENT_DOCUMENT_TYPE_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PATIENT_DOCUMENT_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            {isRefreshing ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
                <Loader2Icon className="size-6 animate-spin text-brand-blue" />
              </div>
            ) : null}

            {initialData.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-10 text-center text-sm text-muted-foreground">
                No documents uploaded for this patient.
              </div>
            ) : (
              <div className="space-y-4">
                <PatientDocumentsGrid
                  items={initialData.items}
                  onView={setViewDoc}
                  onDelete={setDeleteDoc}
                />
                <PaginationControls
                  page={initialData.pagination.page}
                  pageSize={initialData.pagination.limit}
                  totalItems={initialData.pagination.total}
                  onPageChange={(page) => updateParams({ docsPage: page })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PatientDocumentUploadDialog
        patientId={patientId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={refresh}
      />

      <PatientDocumentViewDialog
        document={viewDoc}
        open={Boolean(viewDoc)}
        onOpenChange={(open) => {
          if (!open) setViewDoc(null);
        }}
      />

      <PatientDocumentDeleteDialog
        documentId={deleteDoc?.id ?? null}
        documentName={deleteDoc?.name ?? null}
        open={Boolean(deleteDoc)}
        onOpenChange={(open) => {
          if (!open) setDeleteDoc(null);
        }}
        onComplete={refresh}
      />
    </>
  );
}
