import type { Model, Types } from "mongoose";

import type { Gender } from "@/constants/patient";
import type { PrescriptionStatus } from "@/constants/statuses";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Embedded medication line on a prescription.
 * Always loaded with the Rx — not a standalone catalog in v1.
 */
export type PrescriptionMedication = {
  name: string;
  medicineId?: Types.ObjectId | null;
  genericName?: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  route: string | null;
  instructions: string | null;
  quantity: string | null;
};

/**
 * Structured medical history captured on the prescription.
 * Optional on legacy documents — treat missing as empty at DTO boundaries.
 */
export type PrescriptionMedicalHistory = {
  takingMedication: boolean;
  currentMedication: string | null;
  pregnant: boolean;
  dueDate: Date | null;
  nursing: boolean;
  panMasala: boolean;
  tobacco: boolean;
  smoking: boolean;
  cigarettesPerDay: number | null;
  hasAllergy: boolean;
  allergyName: string | null;
};

/** Patient fields frozen at issue/amend time. */
export type PrescriptionPatientSnapshot = {
  fullName: string;
  phone: string;
  /** Age in whole years at issue time (optional for drafts). */
  ageYears: number | null;
  gender: Gender | null;
};

/** Doctor fields frozen at issue/amend time. */
export type PrescriptionDoctorSnapshot = {
  fullName: string;
  qualification: string | null;
};

/**
 * E-prescription document fields.
 *
 * @see docs/database-architecture.md §3.6
 * @see docs/04-database-design.md §C.4
 */
export type PrescriptionFields = {
  prescriptionNumber: string;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentId: Types.ObjectId | null;
  status: PrescriptionStatus;
  diagnosis: string | null;
  chiefComplaint: string | null;
  clinicalNotes: string | null;
  advice: string | null;
  /** Optional for backward compatibility with pre-history prescriptions. */
  medicalHistory: PrescriptionMedicalHistory | null;
  followUpDate: Date | null;
  medications: PrescriptionMedication[];
  issuedAt: Date | null;
  validUntil: Date | null;
  pdfUrl: string | null;
  /** Cloudinary (or object-storage) public id for signed deletes later. */
  pdfPublicId: string | null;
  patientSnapshot: PrescriptionPatientSnapshot;
  doctorSnapshot: PrescriptionDoctorSnapshot;
  createdByUserId: Types.ObjectId;
  voidReason: string | null;
  voidedAt: Date | null;
  voidedByUserId: Types.ObjectId | null;
  /** Prior prescription this amend supersedes (optional clinical chain). */
  supersedesPrescriptionId: Types.ObjectId | null;
};

export type PrescriptionDocument = SoftDeleteDocument & PrescriptionFields;

export type LeanPrescription = LeanSoftDeleteDocument & PrescriptionFields;

export type PrescriptionModel = Model<
  PrescriptionDocument,
  SoftDeleteQueryHelpers
>;
