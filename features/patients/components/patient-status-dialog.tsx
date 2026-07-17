"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updatePatientActiveStatusAction } from "@/features/patients/actions";
import { PATIENT_STATUSES, type PatientStatus } from "@/constants/statuses";
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

type PatientStatusDialogProps = {
  patientId: string;
  currentStatus: PatientStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function PatientStatusDialog({
  patientId,
  currentStatus,
  open,
  onOpenChange,
  onComplete,
}: PatientStatusDialogProps) {
  const [isPending, startTransition] = useTransition();
  const markingInactive = currentStatus === PATIENT_STATUSES.ACTIVE;
  const nextStatus = markingInactive
    ? PATIENT_STATUSES.INACTIVE
    : PATIENT_STATUSES.ACTIVE;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {markingInactive
              ? "Mark patient inactive?"
              : "Mark patient active?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {markingInactive
              ? "Inactive patients remain in history but are flagged as not currently active at the clinic."
              : "This patient will be marked active again for clinic administration."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className={cn(
              markingInactive && buttonVariants({ variant: "destructive" }),
            )}
            onClick={() => {
              startTransition(async () => {
                const result = await updatePatientActiveStatusAction({
                  id: patientId,
                  data: { status: nextStatus },
                });
                if (!result.success) {
                  toast.error(result.error.message);
                  return;
                }
                toast.success(
                  markingInactive
                    ? "Patient marked inactive"
                    : "Patient marked active",
                );
                onOpenChange(false);
                onComplete();
              });
            }}
          >
            {isPending
              ? "Please wait…"
              : markingInactive
                ? "Mark inactive"
                : "Mark active"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
