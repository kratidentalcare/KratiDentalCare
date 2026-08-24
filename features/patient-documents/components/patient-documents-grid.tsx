"use client";

import { FileTextIcon } from "lucide-react";

import type { PatientDocumentListItem } from "@/features/patient-documents/types";
import { Button } from "@/components/ui/button";

type PatientDocumentsGridProps = {
  items: PatientDocumentListItem[];
  onView: (doc: PatientDocumentListItem) => void;
  onDelete: (doc: PatientDocumentListItem) => void;
};

function formatUploadDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PatientDocumentsGrid({
  items,
  onView,
  onDelete,
}: PatientDocumentsGridProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((doc) => {
        const isImage = doc.mimeType.startsWith("image/");
        return (
          <li
            key={doc.id}
            className="flex flex-col overflow-hidden rounded-xl ring-1 ring-foreground/10"
          >
            <button
              type="button"
              className="relative flex aspect-[4/3] items-center justify-center bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                if (doc.mimeType === "application/pdf") {
                  window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
                  return;
                }
                onView(doc);
              }}
            >
              {isImage && doc.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.thumbnailUrl}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <FileTextIcon className="size-10 text-muted-foreground" />
              )}
            </button>

            <div className="flex flex-1 flex-col gap-2 p-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium text-brand-dark">
                  {doc.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.typeLabel} · {doc.fileExtension} · {doc.fileSizeLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  Uploaded by {doc.uploadedByName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatUploadDate(doc.createdAt)}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (doc.mimeType === "application/pdf") {
                      window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
                      return;
                    }
                    onView(doc);
                  }}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={doc.fileUrl}
                      download={doc.originalFileName ?? doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Download
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(doc)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
