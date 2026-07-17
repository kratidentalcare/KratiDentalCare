import "server-only";

import { Types } from "mongoose";

import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { calculateAgeYears } from "@/features/prescriptions/lib/age";
import { formatSlotLabel } from "@/features/appointments/lib/format";
import {
  formatDisplayDate,
  generatePrescriptionNumber,
} from "@/features/prescriptions/lib/format";
import { mapPrescriptionDetail } from "@/features/prescriptions/lib/map-prescription";
import {
  findPrescriptionByAppointmentId,
  findPrescriptionByIdOrThrow,
  insertPrescription,
  updatePrescriptionById,
} from "@/features/prescriptions/repositories/prescription-repository";
import type {
  PrescriptionDetail,
  PrescriptionWorkspaceContext,
} from "@/features/prescriptions/types";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { utcToCivilDate } from "@/features/scheduling/lib/timezone";
import { connect } from "@/lib/db";
import { DomainError, NotFoundError } from "@/lib/errors";
import { Appointment, type LeanAppointment } from "@/models/appointment";
import { Doctor, type LeanDoctor } from "@/models/doctor";
import { Patient, type LeanPatient } from "@/models/patient";
import { PRESCRIPTION_STATUSES } from "@/constants/statuses";
import { ERROR_CODES } from "@/constants/error-codes";
import type { PrescriptionFormInput } from "@/validators/prescription";

async function loadAppointmentOrThrow(
  appointmentId: string,
): Promise<LeanAppointment> {
  const appointment = await Appointment.findOne({
    _id: new Types.ObjectId(appointmentId),
    deletedAt: null,
  }).lean<LeanAppointment>();

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  return appointment;
}

async function loadPatientOrThrow(patientId: Types.ObjectId): Promise<LeanPatient> {
  const patient = await Patient.findOne({
    _id: patientId,
    deletedAt: null,
  }).lean<LeanPatient>();

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  return patient;
}

async function loadDoctorOrThrow(doctorId: Types.ObjectId): Promise<LeanDoctor> {
  const doctor = await Doctor.findOne({
    _id: doctorId,
    deletedAt: null,
  }).lean<LeanDoctor>();

  if (!doctor) {
    throw new NotFoundError("Doctor not found");
  }

  return doctor;
}

function assertAppointmentCompleted(appointment: LeanAppointment): void {
  if (appointment.status !== APPOINTMENT_STATUSES.COMPLETED) {
    throw new DomainError(
      ERROR_CODES.VALIDATION_ERROR,
      "Prescriptions can only be created for completed appointments",
    );
  }
}

function mapFormMedications(input: PrescriptionFormInput["medications"]) {
  return input.map((med) => ({
    name: med.medicineName,
    dosage: med.dosage,
    frequency: med.frequency,
    duration: med.duration,
    route: null,
    instructions: med.instructions ?? null,
    quantity: null,
  }));
}

function parseFollowUpDate(
  civil: string | null,
  timezone: string,
): Date | null {
  if (!civil) {
    return null;
  }
  // Store as noon UTC-equivalent of civil date via clinic timezone helpers when available.
  // Civil date is YYYY-MM-DD — interpret as UTC midnight for stable calendar date.
  const [year, month, day] = civil.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  void timezone;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Resolve create vs edit workspace for an appointment.
 */
export async function resolvePrescriptionWorkspace(
  appointmentId: string,
): Promise<PrescriptionWorkspaceContext> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const appointment = await loadAppointmentOrThrow(appointmentId);
  assertAppointmentCompleted(appointment);

  const existing = await findPrescriptionByAppointmentId(appointmentId);
  if (existing) {
    return {
      mode: "edit",
      prescription: mapPrescriptionDetail(
        existing,
        appointment,
        settings.timezone,
      ),
    };
  }

  const [patient, doctor] = await Promise.all([
    loadPatientOrThrow(appointment.patientId),
    loadDoctorOrThrow(appointment.doctorId),
  ]);

  const ageYears = calculateAgeYears(patient.dateOfBirth);

  return {
    mode: "create",
    appointmentId,
    patientId: String(patient._id),
    doctorId: String(doctor._id),
    patientName: patient.fullName,
    patientPhone: patient.phone,
    patientAgeYears: ageYears,
    patientGender: patient.gender,
    doctorName: doctor.fullName,
    doctorQualification: doctor.qualification,
    appointmentDate: utcToCivilDate(appointment.startsAt, settings.timezone),
    appointmentTimeLabel: formatSlotLabel(
      appointment.startsAt,
      settings.timezone,
    ),
    issuedDateLabel: formatDisplayDate(new Date()),
  };
}

export async function getPrescriptionDetail(
  id: string,
): Promise<PrescriptionDetail> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const prescription = await findPrescriptionByIdOrThrow(id);

  let appointment: LeanAppointment | null = null;
  if (prescription.appointmentId) {
    appointment = await Appointment.findOne({
      _id: prescription.appointmentId,
      deletedAt: null,
    }).lean<LeanAppointment>();
  }

  return mapPrescriptionDetail(prescription, appointment, settings.timezone);
}

/**
 * Create or update the single prescription for a completed appointment.
 */
export async function savePrescriptionForAppointment(
  input: PrescriptionFormInput,
  createdByUserId: string,
): Promise<PrescriptionDetail> {
  await connect();

  const settings = await getOrCreateClinicSettings();
  const appointment = await loadAppointmentOrThrow(input.appointmentId);
  assertAppointmentCompleted(appointment);

  const [patient, doctor] = await Promise.all([
    loadPatientOrThrow(appointment.patientId),
    loadDoctorOrThrow(appointment.doctorId),
  ]);

  if (String(patient._id) !== String(appointment.patientId)) {
    throw new DomainError(
      ERROR_CODES.VALIDATION_ERROR,
      "Patient does not match appointment",
    );
  }

  const now = new Date();
  const ageYears = calculateAgeYears(patient.dateOfBirth, now);

  const medications = mapFormMedications(input.medications);
  const followUpDate = parseFollowUpDate(input.followUpDate, settings.timezone);

  const clinicalFields = {
    diagnosis: input.diagnosis,
    chiefComplaint: input.chiefComplaint,
    clinicalNotes: input.clinicalNotes,
    advice: input.advice,
    followUpDate,
    medications,
    status: PRESCRIPTION_STATUSES.ISSUED,
    issuedAt: now,
    patientSnapshot: {
      fullName: patient.fullName,
      phone: patient.phone,
      ageYears,
      gender: patient.gender,
    },
    doctorSnapshot: {
      fullName: doctor.fullName,
      qualification: doctor.qualification,
    },
  };

  const existing = await findPrescriptionByAppointmentId(input.appointmentId);

  if (existing) {
    const updated = await updatePrescriptionById(String(existing._id), clinicalFields);
    return mapPrescriptionDetail(updated, appointment, settings.timezone);
  }

  const created = await insertPrescription({
    prescriptionNumber: generatePrescriptionNumber(now),
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    appointmentId: appointment._id,
    createdByUserId: new Types.ObjectId(createdByUserId),
    ...clinicalFields,
  });

  const saved = await findPrescriptionByIdOrThrow(String(created._id));
  return mapPrescriptionDetail(saved, appointment, settings.timezone);
}
