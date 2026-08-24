"use client";

import { FileTextIcon } from "lucide-react";

import type { PatientDocumentListItem } from "@/features/patient-documents/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PatientDocumentViewDialogProps = {
  document: PatientDocumentListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PatientDocumentViewDialog({
  document,
  open,
  onOpenChange,
}: PatientDocumentViewDialogProps) {
  if (!document) {
    return null;
  }

  const isImage = document.mimeType.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{document.name}</DialogTitle>
          <DialogDescription>
            {document.typeLabel} · {document.fileExtension} ·{" "}
            {document.fileSizeLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-lg bg-muted/40 p-2">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.fileUrl}
              alt={document.name}
              className="max-h-[65vh] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <FileTextIcon className="size-12" />
              <p className="text-sm">
                {isPdf
                  ? "PDF preview opens in a new tab."
                  : "This file type opens in a new tab."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(document.fileUrl, "_blank", "noopener,noreferrer")}
          >
            Open
          </Button>
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={document.fileUrl}
                download={document.originalFileName ?? document.name}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Download
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
