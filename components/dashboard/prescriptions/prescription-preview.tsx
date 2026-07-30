import { Fragment } from "react";

import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  PRESCRIPTION_LAYOUT,
  PRESCRIPTION_MEDICINE_COLUMNS,
  PRESCRIPTION_TEMPLATE_PATH,
  prescriptionPositions,
  type OverlayBox,
  type PrescriptionMedicineColumn,
} from "@/features/prescriptions/lib/layout";
import { paginatePrescriptionSheets } from "@/features/prescriptions/lib/paginate-sheets";
import type {
  PrescriptionMedicalHistoryLine,
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

/** Uppercase micro-label shared by section headings and table headers. */
const LABEL_CLASS = "font-bold tracking-[0.07em] text-brand-navy uppercase";

/** History rows a prescriber must not miss get the red brand accent. */
const CRITICAL_HISTORY_LABELS = new Set(["Allergy", "Pregnant"]);

function OverlayText({
  box,
  children,
  className,
  fontSizePt,
}: {
  box: OverlayBox;
  children: React.ReactNode;
  className?: string;
  fontSizePt?: number;
}) {
  return (
    <div
      className={cn(
        "absolute overflow-hidden leading-tight text-slate-900",
        className,
      )}
      style={{
        top: `${box.top}%`,
        left: `${box.left}%`,
        width: `${box.width}%`,
        height: box.height === undefined ? undefined : `${box.height}%`,
        fontSize: fontSizePt === undefined ? undefined : `${fontSizePt}pt`,
      }}
    >
      {children}
    </div>
  );
}

/** Small rotated square that anchors each section label. */
function SectionMarker() {
  return (
    <span
      aria-hidden
      className="mr-[1.7mm] inline-block h-[1.5mm] w-[1.5mm] -translate-y-[0.4mm] rotate-45 bg-brand-red"
    />
  );
}

function PrescriptionTextSection({ lines }: { lines: string[] }) {
  if (lines.length === 0) {
    return null;
  }

  const [firstLine = "", ...continuationLines] = lines;
  const separatorIndex = firstLine.indexOf(":");
  const label = separatorIndex >= 0 ? firstLine.slice(0, separatorIndex) : "";
  const value =
    separatorIndex >= 0
      ? firstLine.slice(separatorIndex + 1).trim()
      : firstLine;

  return (
    <section>
      <p>
        {label ? (
          <>
            <SectionMarker />
            <span
              className={LABEL_CLASS}
              style={{ fontSize: `${PRESCRIPTION_LAYOUT.labelFontSizePt}pt` }}
            >
              {label}
            </span>{" "}
          </>
        ) : null}
        {value}
      </p>
      {continuationLines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </section>
  );
}

function MedicalHistorySection({
  lines,
}: {
  lines: PrescriptionMedicalHistoryLine[];
}) {
  return (
    <section className="rounded-r-[1.2mm] border-y border-y-brand-navy/15 border-r border-r-brand-navy/15 border-l-[1mm] border-l-brand-navy bg-brand-surface px-[3.2mm] py-[2mm]">
      <p
        className={cn(LABEL_CLASS, "mb-[1.2mm]")}
        style={{ fontSize: `${PRESCRIPTION_LAYOUT.labelFontSizePt}pt` }}
      >
        <SectionMarker />
        Medical History
      </p>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-[3.4mm] gap-y-[0.6mm]">
        {lines.map((line) => {
          const isCritical = CRITICAL_HISTORY_LABELS.has(line.label);
          return (
            <Fragment key={line.label}>
              <dt
                className={cn(
                  "font-semibold",
                  isCritical ? "text-brand-red" : "text-brand-muted",
                )}
              >
                {line.label}
              </dt>
              <dd
                className={cn(
                  "min-w-0",
                  isCritical ? "font-semibold text-brand-red" : "text-slate-900",
                )}
              >
                {line.value}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </section>
  );
}

function medicineCell(
  medicine: PrescriptionMedicineDto,
  columnKey: PrescriptionMedicineColumn["key"],
  rowIndex: number,
): string {
  switch (columnKey) {
    case "serial":
      return String(rowIndex + 1);
    case "medicineName":
      return medicine.medicineName;
    case "dosage":
      return medicine.dosage;
    case "frequency":
      return medicine.frequency;
    case "duration":
      return medicine.duration;
    case "instructions":
      return medicine.instructions ?? "";
    default:
      return "";
  }
}

function MedicineTableSection({
  medicines,
}: {
  medicines: PrescriptionMedicineDto[];
}) {
  return (
    <table
      className="w-full table-fixed border-collapse"
      style={{ fontSize: `${PRESCRIPTION_LAYOUT.tableFontSizePt}pt` }}
    >
      <thead>
        <tr className="bg-brand-navy/[0.07]">
          {PRESCRIPTION_MEDICINE_COLUMNS.map((column) => (
            <th
              key={column.key}
              className={cn(
                LABEL_CLASS,
                "border-y border-brand-navy/30 px-[1.9mm] py-[1.5mm]",
                column.align === "center" ? "text-center" : "text-left",
              )}
              style={{
                width: `${column.widthPercent}%`,
                fontSize: `${PRESCRIPTION_LAYOUT.labelFontSizePt}pt`,
              }}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {medicines.map((medicine, rowIndex) => (
          <tr
            key={`${medicine.medicineName}-${rowIndex}`}
            className="even:bg-slate-50"
          >
            {PRESCRIPTION_MEDICINE_COLUMNS.map((column) => (
              <td
                key={column.key}
                className={cn(
                  "border-b border-slate-200 px-[1.9mm] py-[1.4mm] align-top break-words",
                  column.align === "center"
                    ? "text-center tabular-nums"
                    : "text-left",
                  column.key === "medicineName"
                    ? "font-semibold text-brand-navy"
                    : "text-slate-800",
                )}
              >
                {medicineCell(medicine, column.key, rowIndex) || "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
            className="absolute top-0 left-0 m-0 overflow-hidden bg-white p-0 font-montserrat shadow-sm ring-1 ring-[#E5E7EB] [print-color-adjust:exact] [-webkit-print-color-adjust:exact] print:shadow-none print:ring-0"
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
                  className="text-[9pt] font-semibold text-brand-muted tabular-nums"
                >
                  {sheet.pageIndex + 1}/{sheet.pageCount}
                </OverlayText>
              ) : null}

              <OverlayText
                box={prescriptionPositions.patientName}
                fontSizePt={PRESCRIPTION_LAYOUT.headerFontSizePt}
                className="font-semibold text-brand-navy text-ellipsis whitespace-nowrap"
              >
                {sheet.header.patientName || "—"}
              </OverlayText>
              <OverlayText
                box={prescriptionPositions.ageSex}
                fontSizePt={PRESCRIPTION_LAYOUT.headerFontSizePt}
                className="font-medium text-ellipsis whitespace-nowrap tabular-nums"
              >
                {sheet.header.ageSexLabel || "—"}
              </OverlayText>
              {/* Narrowest header box — one step down so the date never clips. */}
              <OverlayText
                box={prescriptionPositions.date}
                fontSizePt={10}
                className="font-medium text-ellipsis whitespace-nowrap tabular-nums"
              >
                {sheet.header.dateLabel || "—"}
              </OverlayText>
              <OverlayText
                box={prescriptionPositions.mobile}
                fontSizePt={PRESCRIPTION_LAYOUT.headerFontSizePt}
                className="font-medium text-ellipsis whitespace-nowrap tabular-nums"
              >
                {sheet.header.mobileLabel || "—"}
              </OverlayText>
              <OverlayText
                box={prescriptionPositions.opdNumber}
                fontSizePt={PRESCRIPTION_LAYOUT.headerFontSizePt}
                className="font-medium text-ellipsis whitespace-nowrap tabular-nums"
              >
                {sheet.header.opdLabel || "—"}
              </OverlayText>

              <div
                data-prescription-content
                className="absolute flex flex-col gap-[3mm] overflow-hidden text-slate-900"
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
                  <p
                    className={cn(LABEL_CLASS, "text-brand-muted")}
                    style={{
                      fontSize: `${PRESCRIPTION_LAYOUT.labelFontSizePt}pt`,
                    }}
                  >
                    Prescription continued
                  </p>
                ) : null}

                {sheet.medicalHistory.length > 0 ? (
                  <MedicalHistorySection lines={sheet.medicalHistory} />
                ) : null}

                <PrescriptionTextSection lines={sheet.diagnosisLines} />
                <PrescriptionTextSection lines={sheet.chiefComplaintLines} />
                <PrescriptionTextSection lines={sheet.clinicalNotesLines} />
                <PrescriptionTextSection lines={sheet.adviceLines} />

                {sheet.medications.length > 0 ? (
                  <MedicineTableSection medicines={sheet.medications} />
                ) : null}

                {sheet.followUpLabel ? (
                  <div className="flex justify-end">
                    <span
                      className="rounded-full border border-brand-navy/25 bg-brand-navy/[0.07] px-[4mm] py-[1.1mm] font-semibold text-brand-navy"
                      style={{
                        fontSize: `${PRESCRIPTION_LAYOUT.tableFontSizePt}pt`,
                      }}
                    >
                      {sheet.followUpLabel}
                    </span>
                  </div>
                ) : null}
              </div>

              {sheet.showSignature ? (
                <OverlayText
                  box={prescriptionPositions.signature}
                  className="text-right text-[9.5pt] leading-tight text-brand-muted"
                >
                  <div className="border-t border-brand-navy/40 pt-[1.6mm]">
                    <p className="font-semibold text-brand-navy">
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
