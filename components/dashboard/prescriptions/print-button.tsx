"use client";

import { DownloadIcon, Loader2Icon, PrinterIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

type PrintButtonProps = {
  prescriptionId: string;
  prescriptionNumber?: string;
};

async function downloadPdf(prescriptionId: string, disposition: "inline" | "attachment") {
  const url = `${ROUTES.API.DASHBOARD_PRESCRIPTIONS}/${prescriptionId}/pdf?disposition=${disposition}`;
  const response = await fetch(url);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error?.message ?? "Failed to generate prescription PDF",
    );
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  if (disposition === "inline") {
    window.open(objectUrl, "_blank", "noopener,noreferrer");
  } else {
    const anchor = document.createElement("a");
    const filename =
      response.headers
        .get("Content-Disposition")
        ?.match(/filename="(.+)"/)?.[1] ?? `prescription-${prescriptionId}.pdf`;
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
  }

  // Delay revoke so the new tab can load the blob.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function PrintButton({ prescriptionId }: PrintButtonProps) {
  const [busy, setBusy] = useState<"print" | "download" | null>(null);

  const run = async (disposition: "inline" | "attachment") => {
    setBusy(disposition === "inline" ? "print" : "download");
    try {
      await downloadPdf(prescriptionId, disposition);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "PDF generation failed",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => void run("inline")}
      >
        {busy === "print" ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PrinterIcon className="size-4" />
        )}
        Print
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => void run("attachment")}
      >
        {busy === "download" ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <DownloadIcon className="size-4" />
        )}
        Download PDF
      </Button>
    </div>
  );
}
