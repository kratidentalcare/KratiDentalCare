import "server-only";

import { DOCTOR_STATUSES } from "@/constants/statuses";
import { connect } from "@/lib/db";
import { Doctor, type LeanDoctor } from "@/models/doctor";

export type DoctorOption = {
  id: string;
  fullName: string;
  specialties: string[];
};

/**
 * Lists active, available doctors for clinic settings default-doctor picker.
 */
export async function listBookableDoctors(): Promise<DoctorOption[]> {
  await connect();

  const doctors = await Doctor.find({
    deletedAt: null,
    isActive: true,
    status: DOCTOR_STATUSES.ACTIVE,
    isAvailable: true,
  })
    .sort({ displayOrder: 1, fullName: 1 })
    .select({ fullName: 1, specialties: 1 })
    .lean<LeanDoctor[]>();

  return doctors.map((doctor) => ({
    id: String(doctor._id),
    fullName: doctor.fullName,
    specialties: doctor.specialties,
  }));
}
