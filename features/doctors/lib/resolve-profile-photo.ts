const DEFAULT_DOCTOR_PHOTO = "/images/hero/drgaurav.jpeg";

/** Known incorrect paths stored in legacy/demo records. */
const PROFILE_PHOTO_ALIASES: Record<string, string> = {
  "/images/hero/drgaurav.png": DEFAULT_DOCTOR_PHOTO,
};

/**
 * Resolve a doctor profile photo path, falling back when missing or aliased.
 */
export function resolveDoctorProfilePhoto(
  photo: string | null | undefined,
): string {
  const trimmed = photo?.trim();
  if (!trimmed) {
    return DEFAULT_DOCTOR_PHOTO;
  }

  return PROFILE_PHOTO_ALIASES[trimmed] ?? trimmed;
}
