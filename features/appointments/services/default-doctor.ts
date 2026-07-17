import "server-only";

import { Types } from "mongoose";

import { DOCTOR_STATUSES } from "@/constants/statuses";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { connect } from "@/lib/db";
import { ConfigurationError, NotFoundError } from "@/lib/errors";
import { Doctor, type LeanDoctor } from "@/models/doctor";

const bookableDoctorFilter = {
  deletedAt: null,
  isActive: true,
  status: DOCTOR_STATUSES.ACTIVE,
  isAvailable: true,
} as const;

/**
 * Resolves the clinic-configured default doctor for public booking.
 * Falls back to the first bookable doctor when no default is set.
 */
export async function resolveDefaultDoctor(): Promise<LeanDoctor> {
  await connect();

  const settings = await getOrCreateClinicSettings();

  if (settings.defaultDoctorId) {
    const configured = await Doctor.findOne({
      _id: settings.defaultDoctorId,
      ...bookableDoctorFilter,
    }).lean<LeanDoctor>();

    if (configured) {
      return configured;
    }
  }

  const fallback = await Doctor.findOne(bookableDoctorFilter)
    .sort({ displayOrder: 1, fullName: 1 })
    .lean<LeanDoctor>();

  if (!fallback) {
    throw new ConfigurationError(
      "Default doctor is not configured. Please set a default doctor in clinic settings.",
    );
  }

  return fallback;
}

export async function getDoctorByIdOrThrow(
  doctorId: string,
): Promise<LeanDoctor> {
  await connect();

  const doctor = await Doctor.findOne({
    _id: new Types.ObjectId(doctorId),
    deletedAt: null,
    isActive: true,
    status: DOCTOR_STATUSES.ACTIVE,
    isAvailable: true,
  }).lean<LeanDoctor>();

  if (!doctor) {
    throw new NotFoundError("Doctor not found or unavailable");
  }

  return doctor;
}
