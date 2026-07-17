import { formatSlotLabel } from "@/features/appointments/lib/format";
import {
  formatAgeSexLabel,
  formatCivilDateLabel,
  formatDisplayDate,
  shortOpdLabel,
} from "@/features/prescriptions/lib/format";
import { toPreviewData } from "@/features/prescriptions/lib/paginate-sheets";
import type {
  PrescriptionDetail,
  PrescriptionListItem,
  PrescriptionMedicineDto,
  PrescriptionPreviewData,
} from "@/features/prescriptions/types";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";
import type { LeanAppointment } from "@/models/appointment";
import type { LeanPrescription } from "@/models/prescription";

export function mapMedications(
  medications: LeanPrescription["medications"],
): PrescriptionMedicineDto[] {
  return medications.map((med) => ({
    medicineName: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    duration: med.duration,
    instructions: med.instructions,
  }));
}

export function mapPrescriptionDetail(
  prescription: LeanPrescription,
  appointment: LeanAppointment | null,
  timezone: string,
): PrescriptionDetail {
  const issuedAt = prescription.issuedAt;
  const appointmentDate = appointment
    ? utcToCivilDate(appointment.startsAt, timezone)
    : null;
  const appointmentTimeLabel = appointment
    ? formatSlotLabel(appointment.startsAt, timezone)
    : null;

  return {
    id: String(prescription._id),
    prescriptionNumber: prescription.prescriptionNumber,
    status: prescription.status,
    appointmentId: prescription.appointmentId
      ? String(prescription.appointmentId)
      : null,
    patientId: String(prescription.patientId),
    doctorId: String(prescription.doctorId),
    patientName: prescription.patientSnapshot.fullName,
    patientPhone: prescription.patientSnapshot.phone,
    patientAgeYears: prescription.patientSnapshot.ageYears,
    patientGender: prescription.patientSnapshot.gender ?? null,
    doctorName: prescription.doctorSnapshot.fullName,
    doctorQualification: prescription.doctorSnapshot.qualification,
    appointmentDate,
    appointmentTimeLabel,
    issuedAt: issuedAt?.toISOString() ?? null,
    issuedDateLabel: formatDisplayDate(issuedAt),
    chiefComplaint: prescription.chiefComplaint,
    diagnosis: prescription.diagnosis,
    clinicalNotes: prescription.clinicalNotes,
    advice: prescription.advice,
    followUpDate: prescription.followUpDate
      ? utcToCivilDate(prescription.followUpDate, timezone)
      : null,
    medications: mapMedications(prescription.medications),
    createdAt: prescription.createdAt.toISOString(),
    updatedAt: prescription.updatedAt.toISOString(),
  };
}

export function mapPrescriptionListItem(
  prescription: LeanPrescription,
): PrescriptionListItem {
  return {
    id: String(prescription._id),
    prescriptionNumber: prescription.prescriptionNumber,
    status: prescription.status,
    patientId: String(prescription.patientId),
    patientName: prescription.patientSnapshot.fullName,
    doctorName: prescription.doctorSnapshot.fullName,
    appointmentId: prescription.appointmentId
      ? String(prescription.appointmentId)
      : null,
    diagnosis: prescription.diagnosis,
    issuedAt: prescription.issuedAt?.toISOString() ?? null,
    issuedDateLabel: formatDisplayDate(prescription.issuedAt),
    medicationCount: prescription.medications.length,
  };
}

export function detailToPreviewData(
  detail: PrescriptionDetail,
): PrescriptionPreviewData {
  return toPreviewData({
    patientName: detail.patientName,
    ageSexLabel: formatAgeSexLabel(
      detail.patientAgeYears,
      detail.patientGender,
    ),
    dateLabel: detail.issuedDateLabel,
    opdLabel: shortOpdLabel(detail.appointmentId, detail.prescriptionNumber),
    diagnosis: detail.diagnosis ?? "",
    chiefComplaint: detail.chiefComplaint ?? "",
    clinicalNotes: detail.clinicalNotes ?? "",
    advice: detail.advice ?? "",
    followUpLabel: detail.followUpDate
      ? `Follow-up: ${formatCivilDateLabel(detail.followUpDate)}`
      : "",
    medications: detail.medications,
    doctorName: detail.doctorName,
    doctorQualification: detail.doctorQualification,
  });
}
