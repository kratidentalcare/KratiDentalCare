import "server-only";

import { Types } from "mongoose";

import { DOCTOR_STATUSES } from "@/constants/statuses";
import { getOrCreateClinicSettings } from "@/features/scheduling/services/clinic-settings";
import { connect } from "@/lib/db";
import { ConfigurationError, NotFoundError } from "@/lib/errors";
import { Doctor, type LeanDoctor } from "@/models/doctor";

/**
 * Resolves the clinic-configured default doctor for public booking.
 */
export async function resolveDefaultDoctor(): Promise<LeanDoctor> {
  await connect();

  const settings = await getOrCreateClinicSettings();

  if (!settings.defaultDoctorId) {
    throw new ConfigurationError(
      "Default doctor is not configured. Please set a default doctor in clinic settings.",
    );
  }

  const doctor = await Doctor.findOne({
    _id: settings.defaultDoctorId,
    deletedAt: null,
    isActive: true,
    status: DOCTOR_STATUSES.ACTIVE,
    isAvailable: true,
  }).lean<LeanDoctor>();

  if (!doctor) {
    throw new NotFoundError(
      "Configured default doctor is unavailable or not found",
    );
  }

  return doctor;
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
