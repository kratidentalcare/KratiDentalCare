import "server-only";

import type { Weekday } from "@/constants/doctor";
import { DOCTOR_PROFILE_ENRICHMENT } from "@/features/doctors/data/profile-enrichment";
import type { PublicDoctorProfile } from "@/features/doctors/types";
import type { LeanDoctor } from "@/models/doctor";

const FALLBACK_PHOTO = "/images/hero/drgaurav.png";

/**
 * Maps a lean Doctor document (+ optional slug enrichment) to the public DTO.
 */
export function mapLeanDoctorToPublicProfile(
  doctor: LeanDoctor,
): PublicDoctorProfile {
  const enrichment = DOCTOR_PROFILE_ENRICHMENT[doctor.slug] ?? {};
  const specialties = doctor.specialties.map((item) => item.trim()).filter(Boolean);

  const certifications = [
    ...(enrichment.certifications ?? []),
    ...(doctor.registrationNumber
      ? [`Registration No. ${doctor.registrationNumber}`]
      : []),
  ];

  return {
    id: String(doctor._id),
    slug: doctor.slug,
    fullName: doctor.fullName,
    qualification: doctor.qualification,
    yearsOfExperience: doctor.yearsOfExperience,
    specialties,
    bio: doctor.bio,
    languages: doctor.languages ?? [],
    registrationNumber: doctor.registrationNumber,
    profilePhoto: doctor.profilePhoto ?? FALLBACK_PHOTO,
    imageAlt: `${doctor.fullName}${doctor.qualification ? `, ${doctor.qualification}` : ""} at Krati Dental Care`,
    workingDays: doctor.workingDays as Weekday[],
    startTime: doctor.startTime,
    endTime: doctor.endTime,
    education: [...(enrichment.education ?? [])],
    certifications,
    expertise:
      enrichment.expertise && enrichment.expertise.length > 0
        ? [...enrichment.expertise]
        : specialties,
  };
}
