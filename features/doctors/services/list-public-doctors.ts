import "server-only";

import { DOCTOR_STATUSES } from "@/constants/statuses";
import { mapLeanDoctorToPublicProfile } from "@/features/doctors/services/map-public-doctor";
import type { PublicDoctorProfile } from "@/features/doctors/types";
import { connect } from "@/lib/db";
import { Doctor, type LeanDoctor } from "@/models/doctor";

/**
 * Active doctors for the public /doctors page, ordered for display.
 * Soft-deleted rows are excluded by the model plugin.
 */
export async function listPublicDoctors(): Promise<PublicDoctorProfile[]> {
  await connect();

  const rows = await Doctor.find({
    deletedAt: null,
    isActive: true,
    status: DOCTOR_STATUSES.ACTIVE,
  })
    .sort({ displayOrder: 1, fullName: 1 })
    .select({
      fullName: 1,
      slug: 1,
      specialties: 1,
      qualification: 1,
      registrationNumber: 1,
      yearsOfExperience: 1,
      bio: 1,
      languages: 1,
      workingDays: 1,
      startTime: 1,
      endTime: 1,
      profilePhoto: 1,
      displayOrder: 1,
    })
    .lean<LeanDoctor[]>();

  return rows.map(mapLeanDoctorToPublicProfile);
}
