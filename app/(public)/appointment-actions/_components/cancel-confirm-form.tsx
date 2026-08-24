"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import { confirmEmailCancelAction } from "@/features/appointments/actions/email-actions";
import type { EmailActionResultView } from "@/features/appointments/services/email-actions";
import { AppointmentActionResult } from "@/app/(public)/appointment-actions/_components/appointment-action-result";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CancelConfirmFormProps = {
  token: string;
};

export function CancelConfirmForm({ token }: CancelConfirmFormProps) {
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<EmailActionResultView | null>(null);
  const [isPending, startTransition] = useTransition();

  if (result) {
    return <AppointmentActionResult result={result} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Cancel appointment
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Confirm cancellation for this pending appointment. An optional reason
          will be included in the patient email.
        </p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="cancellationReason">Cancellation reason</Label>
          <Textarea
            id="cancellationReason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Optional — defaults to a clinic email cancellation notice"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const response = await confirmEmailCancelAction({
                  token,
                  cancellationReason: reason.trim() || undefined,
                });
                if (response.success) {
                  setResult(response.data);
                } else {
                  setResult({
                    kind: "error",
                    title: "Unable to cancel",
                    message: response.error.message,
                  });
                }
              });
            }}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Confirm cancellation"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
