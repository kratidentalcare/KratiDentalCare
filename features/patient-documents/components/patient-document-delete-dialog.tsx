"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deletePatientDocumentAction } from "@/features/patient-documents/actions";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PatientDocumentDeleteDialogProps = {
  documentId: string | null;
  documentName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function PatientDocumentDeleteDialog({
  documentId,
  documentName,
  open,
  onOpenChange,
  onComplete,
}: PatientDocumentDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document?</AlertDialogTitle>
          <AlertDialogDescription>
            {documentName
              ? `“${documentName}” will be permanently removed from storage and this patient’s records.`
              : "This document will be permanently removed from storage and this patient’s records."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || !documentId}
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => {
              if (!documentId) return;
              startTransition(async () => {
                const result = await deletePatientDocumentAction({
                  documentId,
                });
                if (!result.success) {
                  toast.error(result.error.message);
                  return;
                }
                toast.success("Document deleted");
                onOpenChange(false);
                onComplete();
              });
            }}
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
