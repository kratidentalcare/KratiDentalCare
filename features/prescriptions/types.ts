import type { Gender } from "@/constants/patient";
import type { PrescriptionStatus } from "@/constants/statuses";
import type { PaginationMeta } from "@/types/api";

/** Medicine line as shown in forms / preview / PDF. */
export type PrescriptionMedicineDto = {
  medicineId?: string | null;
  medicineName: string;
  genericName?: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
};

/** Medical history as edited in the form and shown in preview / PDF. */
export type PrescriptionMedicalHistoryDto = {
  takingMedication: boolean;
  currentMedication: string | null;
  pregnant: boolean;
  /** Civil YYYY-MM-DD when pregnant. */
  dueDate: string | null;
  nursing: boolean;
  panMasala: boolean;
  tobacco: boolean;
  smoking: boolean;
  cigarettesPerDay: number | null;
  hasAllergy: boolean;
  allergyName: string | null;
};

/** Full prescription DTO for dashboard surfaces. */
export type PrescriptionDetail = {
  id: string;
  prescriptionNumber: string;
  status: PrescriptionStatus;
  appointmentId: string | null;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  patientAgeYears: number | null;
  patientGender: Gender | null;
  doctorName: string;
  doctorQualification: string | null;
  appointmentDate: string | null;
  appointmentTimeLabel: string | null;
  issuedAt: string | null;
  issuedDateLabel: string;
  chiefComplaint: string | null;
  diagnosis: string | null;
  clinicalNotes: string | null;
  advice: string | null;
  medicalHistory: PrescriptionMedicalHistoryDto;
  followUpDate: string | null;
  medications: PrescriptionMedicineDto[];
  createdAt: string;
  updatedAt: string;
};

export type PrescriptionListItem = {
  id: string;
  prescriptionNumber: string;
  status: PrescriptionStatus;
  patientId: string;
  patientName: string;
  doctorName: string;
  appointmentId: string | null;
  diagnosis: string | null;
  issuedAt: string | null;
  issuedDateLabel: string;
  medicationCount: number;
};

export type PrescriptionListResult = {
  items: PrescriptionListItem[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

/** Compact history row for patient profile. */
export type PatientPrescriptionSummary = {
  id: string;
  prescriptionNumber: string;
  status: PrescriptionStatus;
  diagnosis: string | null;
  doctorName: string;
  issuedAt: string | null;
  issuedDateLabel: string;
  appointmentId: string | null;
  medicationCount: number;
};

/**
 * Auto-filled context for create mode (from completed appointment).
 * Editable clinical fields start empty.
 */
export type PrescriptionCreateContext = {
  mode: "create";
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  patientAgeYears: number | null;
  patientGender: Gender | null;
  doctorName: string;
  doctorQualification: string | null;
  appointmentDate: string;
  appointmentTimeLabel: string;
  issuedDateLabel: string;
};

export type PrescriptionEditContext = {
  mode: "edit";
  prescription: PrescriptionDetail;
};

export type PrescriptionWorkspaceContext =
  | PrescriptionCreateContext
  | PrescriptionEditContext;

/** Normalized view model consumed by preview + PDF (single layout source). */
export type PrescriptionPreviewData = {
  patientName: string;
  ageSexLabel: string;
  dateLabel: string;
  mobileLabel: string;
  opdLabel: string;
  medicalHistory: PrescriptionMedicalHistoryDto | null;
  diagnosis: string;
  chiefComplaint: string;
  clinicalNotes: string;
  advice: string;
  followUpLabel: string;
  medications: PrescriptionMedicineDto[];
  doctorName: string;
  doctorQualification: string | null;
  signatureLabel: string;
};

/** One printable Medical History row — label and value share a line. */
export type PrescriptionMedicalHistoryLine = {
  label: string;
  value: string;
};

export type PrescriptionPreviewSheet = {
  pageIndex: number;
  pageCount: number;
  isContinuation: boolean;
  header: Pick<
    PrescriptionPreviewData,
    "patientName" | "ageSexLabel" | "dateLabel" | "mobileLabel" | "opdLabel"
  >;
  medicalHistory: PrescriptionMedicalHistoryLine[];
  diagnosisLines: string[];
  chiefComplaintLines: string[];
  clinicalNotesLines: string[];
  adviceLines: string[];
  followUpLabel: string;
  medications: PrescriptionMedicineDto[];
  doctorName: string;
  doctorQualification: string | null;
  signatureLabel: string;
  showSignature: boolean;
};
