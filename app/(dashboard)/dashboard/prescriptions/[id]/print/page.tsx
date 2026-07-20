import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrescriptionPreview } from "@/components/dashboard/prescriptions/prescription-preview";
import { detailToPreviewData } from "@/features/prescriptions/lib/map-prescription";
import { getPrescriptionDetail } from "@/features/prescriptions/services/save-prescription";
import { isAppError } from "@/lib/errors";
import { objectIdSchema } from "@/validators/common";

export const metadata: Metadata = {
  title: "Print prescription",
};

type PrintPrescriptionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pdf?: string; autoprint?: string }>;
};

/**
 * Print-only surface that reuses PrescriptionPreview (no second layout).
 * Renders in a fixed overlay so dashboard chrome is not captured in PDF/print.
 */
export default async function PrintPrescriptionPage({
  params,
  searchParams,
}: PrintPrescriptionPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  let detail;
  try {
    detail = await getPrescriptionDetail(parsed.data);
  } catch (error) {
    if (isAppError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const previewData = detailToPreviewData(detail);
  const forPdf = query.pdf === "1";
  const autoPrint = !forPdf && query.autoprint !== "0";

  return (
    <div
      className="prescription-print-root fixed inset-0 z-[9999] overflow-auto bg-white"
      data-prescription-print-root
    >
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html,
          body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            background: white !important;
          }
          [data-slot="sidebar"],
          [data-dashboard-chrome],
          header,
          nav,
          aside {
            display: none !important;
          }
          body *:has(.prescription-print-root) {
            display: block !important;
            width: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .prescription-print-root {
            position: static !important;
            inset: auto !important;
            z-index: auto !important;
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          [data-prescription-sheet] {
            display: block !important;
            box-sizing: border-box !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 0 !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          [data-prescription-sheet]:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>
      <PrescriptionPreview data={previewData} scale={1} />
      {autoPrint ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load',()=>{setTimeout(()=>window.print(),250)});`,
          }}
        />
      ) : null}
    </div>
  );
}
