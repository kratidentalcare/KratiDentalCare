import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  PRESCRIPTION_LAYOUT,
  PRESCRIPTION_TEMPLATE_PATH,
  prescriptionPositions,
  type OverlayBox,
} from "@/features/prescriptions/lib/layout";
import { paginatePrescriptionSheets } from "@/features/prescriptions/lib/paginate-sheets";
import type {
  PrescriptionMedicineDto,
  PrescriptionPreviewData,
} from "@/features/prescriptions/types";
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
  box: OverlayBox;
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
        height: box.height === undefined ? undefined : `${box.height}%`,
      }}
    >
      {children}
    </div>
  );
}

function PrescriptionTextSection({ lines }: { lines: string[] }) {
  if (lines.length === 0) {
    return null;
  }

  const [firstLine = "", ...continuationLines] = lines;
  const separatorIndex = firstLine.indexOf(":");
  const label =
    separatorIndex >= 0 ? firstLine.slice(0, separatorIndex + 1) : "";
  const value =
    separatorIndex >= 0
      ? firstLine.slice(separatorIndex + 1).trim()
      : firstLine;

  return (
    <div className="mb-1">
      <p>
        {label ? <strong className="font-semibold">{label}</strong> : null}
        {label ? " " : null}
        {value}
      </p>
      {continuationLines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  );
}

function MedicineItem({ medicine }: { medicine: PrescriptionMedicineDto }) {
  const directions = [
    medicine.frequency,
    medicine.duration,
    medicine.instructions,
  ].filter(Boolean);

  return (
    <li>
      <p className="font-semibold">
        {medicine.medicineName}
        {medicine.dosage ? ` ${medicine.dosage}` : ""}
      </p>
      {directions.length > 0 ? (
        <p className="text-[10pt] text-slate-700">{directions.join(" · ")}</p>
      ) : null}
    </li>
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
    <div
      className={cn(
        "m-0 flex flex-col gap-4 p-0 print:block print:gap-0",
        className,
      )}
    >
      {sheets.map((sheet) => (
        <div
          key={sheet.pageIndex}
          data-prescription-sheet
          className="relative mx-auto my-0 shrink-0 overflow-hidden p-0 print:mx-0"
          style={{
            width: `${A4_WIDTH_MM * scale}mm`,
            height: `${A4_HEIGHT_MM * scale}mm`,
          }}
        >
          <div
            className="absolute top-0 left-0 m-0 overflow-hidden bg-white p-0 shadow-sm ring-1 ring-[#E5E7EB] print:shadow-none print:ring-0"
            style={{
              width: `${A4_WIDTH_MM}mm`,
              height: `${A4_HEIGHT_MM}mm`,
              boxSizing: "border-box",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={templateSrc}
              alt=""
              className="pointer-events-none absolute inset-0 block h-full w-full object-fill select-none"
              style={{ zIndex: 0 }}
              draggable={false}
            />

            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              {sheet.pageCount > 1 ? (
                <OverlayText
                  box={prescriptionPositions.pageBadge}
                  className="text-[9px] text-slate-500"
                >
                  {sheet.pageIndex + 1}/{sheet.pageCount}
                </OverlayText>
              ) : null}

              <OverlayText
                box={prescriptionPositions.patientName}
                className="font-medium whitespace-nowrap"
              >
                {sheet.header.patientName || "—"}
              </OverlayText>
              <OverlayText
                box={prescriptionPositions.ageSex}
                className="whitespace-nowrap"
              >
                {sheet.header.ageSexLabel || "—"}
              </OverlayText>
              <OverlayText
                box={prescriptionPositions.date}
                className="whitespace-nowrap"
              >
                {sheet.header.dateLabel || "—"}
              </OverlayText>
              <OverlayText
                box={prescriptionPositions.opdNumber}
                className="whitespace-nowrap"
              >
                {sheet.header.opdLabel || "—"}
              </OverlayText>

              <div
                data-prescription-content
                className="absolute overflow-hidden text-slate-900"
                style={{
                  top: `${prescriptionPositions.content.top}%`,
                  left: `${prescriptionPositions.content.left}%`,
                  width: `${prescriptionPositions.content.width}%`,
                  height: `${prescriptionPositions.content.height}%`,
                  fontSize: `${PRESCRIPTION_LAYOUT.bodyFontSizePt}pt`,
                  lineHeight: PRESCRIPTION_LAYOUT.bodyLineHeight,
                }}
              >
                {sheet.isContinuation ? (
                  <p className="mb-1 text-[10pt] font-medium text-slate-500">
                    Prescription continued
                  </p>
                ) : null}

                <PrescriptionTextSection lines={sheet.diagnosisLines} />
                <PrescriptionTextSection lines={sheet.chiefComplaintLines} />
                <PrescriptionTextSection lines={sheet.clinicalNotesLines} />
                <PrescriptionTextSection lines={sheet.adviceLines} />

                {sheet.medications.length > 0 ? (
                  <ol className="mt-1.5 list-decimal space-y-1.5 pl-5">
                    {sheet.medications.map((medicine, index) => (
                      <MedicineItem
                        key={`${medicine.medicineName}-${index}`}
                        medicine={medicine}
                      />
                    ))}
                  </ol>
                ) : null}

                {sheet.followUpLabel ? (
                  <p className="mt-2 font-semibold">{sheet.followUpLabel}</p>
                ) : null}
              </div>

              {sheet.showSignature ? (
                <OverlayText
                  box={prescriptionPositions.signature}
                  className="text-right text-[9pt] leading-tight text-slate-600"
                >
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-medium text-slate-800">
                      {sheet.doctorName}
                    </p>
                    {sheet.doctorQualification ? (
                      <p>{sheet.doctorQualification}</p>
                    ) : null}
                    <p className="italic">{sheet.signatureLabel}</p>
                  </div>
                </OverlayText>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
