import type { AppointmentStatus, PatientStatus } from "@/constants/statuses";
import type { PatientPrescriptionSummary } from "@/features/prescriptions/types";
import type { PaginationMeta } from "@/types/api";

/** List-row DTO for Dashboard → Patients. */
export type PatientListItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: PatientStatus;
  totalAppointments: number;
  lastVisitAt: string | null;
  lastVisitLabel: string | null;
  nextAppointmentAt: string | null;
  nextAppointmentLabel: string | null;
  createdAt: string;
};

export type PatientListResult = {
  items: PatientListItem[];
  pagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

/** Compact appointment summary used on patient profile surfaces. */
export type PatientAppointmentSummary = {
  id: string;
  date: string;
  timeLabel: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  reason: string | null;
  doctorName: string;
  doctorId: string;
};

export type PatientAppointmentStats = {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
};

/**
 * Patient profile DTO.
 * Future Phase fields are reserved as null/empty seams only.
 */
export type PatientProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: PatientStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statistics: PatientAppointmentStats;
  upcomingAppointment: PatientAppointmentSummary | null;
  appointmentHistory: PatientAppointmentSummary[];
  appointmentHistoryPagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  prescriptionHistory: PatientPrescriptionSummary[];
  prescriptionHistoryPagination: PaginationMeta & {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  /** Reserved for multi-doctor scoping (not implemented). */
  primaryDoctorId: string | null;
  /** Reserved medical-history seams (not implemented). */
  medicalHistoryReady: false;
  uploadedReportsReady: false;
  allergiesCount: number;
  hasEmergencyContact: boolean;
  hasInsuranceDetails: false;
};

export type PatientContactUpdateResult = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: PatientStatus;
};

export type PatientStatusUpdateResult = {
  id: string;
  status: PatientStatus;
  isActive: boolean;
};

export type ResolvePatientInput = {
  fullName: string;
  phone: string;
  email?: string | null;
};
