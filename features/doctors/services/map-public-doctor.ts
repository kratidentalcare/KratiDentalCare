import "server-only";

import type { Weekday } from "@/constants/doctor";
import { DOCTOR_PROFILE_ENRICHMENT } from "@/features/doctors/data/profile-enrichment";
import { resolveDoctorProfilePhoto } from "@/features/doctors/lib/resolve-profile-photo";
import type { PublicDoctorProfile } from "@/features/doctors/types";
import type { LeanDoctor } from "@/models/doctor";

/**
 * Maps a lean Doctor document (+ optional slug enrichment) to the public DTO.
 */
export function mapLeanDoctorToPublicProfile(
  doctor: LeanDoctor,
): PublicDoctorProfile {
  const enrichment = DOCTOR_PROFILE_ENRICHMENT[doctor.slug] ?? {};
  const specialties = doctor.specialties.map((item) => item.trim()).filter(Boolean);

  return {
    id: String(doctor._id),
    slug: doctor.slug,
    fullName: doctor.fullName,
    qualification: doctor.qualification,
    yearsOfExperience:
      enrichment.yearsOfExperience ?? doctor.yearsOfExperience,
    specialties,
    bio: doctor.bio,
    languages: doctor.languages ?? [],
    registrationNumber: doctor.registrationNumber,
    profilePhoto: resolveDoctorProfilePhoto(doctor.profilePhoto),
    imageAlt: `${doctor.fullName}${doctor.qualification ? `, ${doctor.qualification}` : ""} at Krati Dental Care`,
    workingDays: doctor.workingDays as Weekday[],
    startTime: doctor.startTime,
    endTime: doctor.endTime,
    education: [...(enrichment.education ?? [])],
    expertise:
      enrichment.expertise && enrichment.expertise.length > 0
        ? [...enrichment.expertise]
        : specialties,
  };
}
