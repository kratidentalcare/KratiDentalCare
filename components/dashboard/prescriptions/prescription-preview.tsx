import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  PRESCRIPTION_LAYOUT,
  PRESCRIPTION_TEMPLATE_PATH,
} from "@/features/prescriptions/lib/layout";
import { paginatePrescriptionSheets } from "@/features/prescriptions/lib/paginate-sheets";
import type { PrescriptionPreviewData } from "@/features/prescriptions/types";
import { cn } from "@/lib/utils";

type PrescriptionPreviewProps = {
  data: PrescriptionPreviewData;
  /** Absolute/data URL override for PDF generation. */
  templateSrc?: string;
  className?: string;
  /** Scale sheets for on-screen preview (print/PDF use 1). */
  scale?: number;
};

function OverlayText({
  box,
  children,
  className,
}: {
  box: { top: number; left: number; width: number };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute overflow-hidden text-[11px] leading-tight text-slate-900",
        className,
      )}
      style={{
        top: `${box.top}%`,
        left: `${box.left}%`,
        width: `${box.width}%`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Single reusable A4 sheet renderer — live preview, print, and PDF.
 * Template image is the letterhead; dynamic fields are absolutely positioned.
 */
export function PrescriptionPreview({
  data,
  templateSrc = PRESCRIPTION_TEMPLATE_PATH,
  className,
  scale = 1,
}: PrescriptionPreviewProps) {
  const sheets = paginatePrescriptionSheets(data);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {sheets.map((sheet) => (
        <div
          key={sheet.pageIndex}
          data-prescription-sheet
          className="relative mx-auto overflow-hidden bg-white shadow-sm ring-1 ring-[#E5E7EB] print:shadow-none print:ring-0"
          style={{
            width: `${A4_WIDTH_MM * scale}mm`,
            height: `${A4_HEIGHT_MM * scale}mm`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={templateSrc}
            alt=""
            className="pointer-events-none absolute inset-0 size-full select-none object-fill"
            draggable={false}
          />

          <div className="absolute inset-0">
            {sheet.pageCount > 1 ? (
              <OverlayText box={PRESCRIPTION_LAYOUT.pageBadge} className="text-[9px] text-slate-500">
                {sheet.pageIndex + 1}/{sheet.pageCount}
              </OverlayText>
            ) : null}

            <OverlayText box={PRESCRIPTION_LAYOUT.patientName} className="font-medium">
              {sheet.header.patientName || "—"}
            </OverlayText>
            <OverlayText box={PRESCRIPTION_LAYOUT.ageSex}>
              {sheet.header.ageSexLabel || "—"}
            </OverlayText>
            <OverlayText box={PRESCRIPTION_LAYOUT.date}>
              {sheet.header.dateLabel || "—"}
            </OverlayText>
            <OverlayText box={PRESCRIPTION_LAYOUT.opd}>
              {sheet.header.opdLabel || "—"}
            </OverlayText>

            <div
              className="absolute overflow-hidden"
              style={{
                top: `${PRESCRIPTION_LAYOUT.bodyStartTop}%`,
                left: `${PRESCRIPTION_LAYOUT.bodyLeft}%`,
                width: `${PRESCRIPTION_LAYOUT.bodyWidth}%`,
                bottom: sheet.showSignature ? "24%" : "18%",
                fontSize: PRESCRIPTION_LAYOUT.bodyFontSizePx,
                lineHeight: PRESCRIPTION_LAYOUT.bodyLineHeight,
              }}
            >
              {sheet.isContinuation ? (
                <p className="mb-1 text-[10px] font-medium text-slate-500">
                  (Continued)
                </p>
              ) : null}

              {[
                ...sheet.diagnosisLines,
                ...sheet.chiefComplaintLines,
                ...sheet.clinicalNotesLines,
                ...sheet.adviceLines,
              ].map((line, index) => (
                <p key={`text-${sheet.pageIndex}-${index}`} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))}

              {sheet.medications.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {!sheet.isContinuation || sheet.medications.length > 0 ? (
                    <p className="font-semibold">Rx</p>
                  ) : null}
                  <ol className="list-decimal space-y-1.5 pl-4">
                    {sheet.medications.map((med, index) => (
                      <li key={`${med.medicineName}-${index}`}>
                        <span className="font-medium">{med.medicineName}</span>
                        {" — "}
                        {med.dosage}, {med.frequency}, {med.duration}
                        {med.instructions ? (
                          <span className="text-slate-600">
                            {" "}
                            ({med.instructions})
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {sheet.followUpLabel ? (
                <p className="mt-2 font-medium">{sheet.followUpLabel}</p>
              ) : null}
            </div>

            {sheet.showSignature ? (
              <OverlayText
                box={PRESCRIPTION_LAYOUT.signature}
                className="text-right text-[10px] text-slate-600"
              >
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-medium text-slate-800">{sheet.doctorName}</p>
                  {sheet.doctorQualification ? (
                    <p>{sheet.doctorQualification}</p>
                  ) : null}
                  <p className="mt-3 italic">{sheet.signatureLabel}</p>
                </div>
              </OverlayText>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
