/**
 * Patient demographic / clinical constants (shared by schema + validators).
 */

export const GENDERS = {
  FEMALE: "female",
  MALE: "male",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer_not_to_say",
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export const GENDER_VALUES = [
  GENDERS.FEMALE,
  GENDERS.MALE,
  GENDERS.OTHER,
  GENDERS.PREFER_NOT_TO_SAY,
] as const;

export const BLOOD_GROUPS = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  UNKNOWN: "UNKNOWN",
} as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[keyof typeof BLOOD_GROUPS];

export const BLOOD_GROUP_VALUES = [
  BLOOD_GROUPS.A_POSITIVE,
  BLOOD_GROUPS.A_NEGATIVE,
  BLOOD_GROUPS.B_POSITIVE,
  BLOOD_GROUPS.B_NEGATIVE,
  BLOOD_GROUPS.AB_POSITIVE,
  BLOOD_GROUPS.AB_NEGATIVE,
  BLOOD_GROUPS.O_POSITIVE,
  BLOOD_GROUPS.O_NEGATIVE,
  BLOOD_GROUPS.UNKNOWN,
] as const;

/** Common emergency-contact relationships (extensible via free-text in schema if needed). */
export const EMERGENCY_CONTACT_RELATIONSHIPS = {
  SPOUSE: "spouse",
  PARENT: "parent",
  CHILD: "child",
  SIBLING: "sibling",
  FRIEND: "friend",
  GUARDIAN: "guardian",
  OTHER: "other",
} as const;

export type EmergencyContactRelationship =
  (typeof EMERGENCY_CONTACT_RELATIONSHIPS)[keyof typeof EMERGENCY_CONTACT_RELATIONSHIPS];

export const EMERGENCY_CONTACT_RELATIONSHIP_VALUES = [
  EMERGENCY_CONTACT_RELATIONSHIPS.SPOUSE,
  EMERGENCY_CONTACT_RELATIONSHIPS.PARENT,
  EMERGENCY_CONTACT_RELATIONSHIPS.CHILD,
  EMERGENCY_CONTACT_RELATIONSHIPS.SIBLING,
  EMERGENCY_CONTACT_RELATIONSHIPS.FRIEND,
  EMERGENCY_CONTACT_RELATIONSHIPS.GUARDIAN,
  EMERGENCY_CONTACT_RELATIONSHIPS.OTHER,
] as const;

export const DEFAULT_ADDRESS_COUNTRY = "IN";
