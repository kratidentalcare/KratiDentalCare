import { Faker, en, en_IN } from "@faker-js/faker";

import {
  BLOOD_GROUP_VALUES,
  EMERGENCY_CONTACT_RELATIONSHIP_VALUES,
  GENDER_VALUES,
} from "@/constants/patient";
import { normalizePhone } from "@/features/patients/lib/phone";

import { SEED_IDS } from "../config";

/** Deterministic faker for idempotent-ish demo content across runs. */
export const seedFaker = new Faker({ locale: [en_IN, en] });
seedFaker.seed(20_01);

const INDIAN_CITIES: readonly { city: string; state: string; postal: string }[] =
  [
    { city: "Lucknow", state: "Uttar Pradesh", postal: "226001" },
    { city: "Kanpur", state: "Uttar Pradesh", postal: "208001" },
    { city: "Noida", state: "Uttar Pradesh", postal: "201301" },
    { city: "Ghaziabad", state: "Uttar Pradesh", postal: "201001" },
    { city: "Varanasi", state: "Uttar Pradesh", postal: "221001" },
    { city: "Prayagraj", state: "Uttar Pradesh", postal: "211001" },
    { city: "Agra", state: "Uttar Pradesh", postal: "282001" },
    { city: "Meerut", state: "Uttar Pradesh", postal: "250001" },
  ];

const STREET_PREFIXES = [
  "Sector",
  "Gomti Nagar",
  "Indira Nagar",
  "Aliganj",
  "Hazratganj",
  "Aminabad",
  "Chowk",
  "Mahanagar",
] as const;

export function indianMobile(index: number): string {
  const number = SEED_IDS.patientPhoneBase + index;
  return `+91${number}`;
}

export function patientSeedEmail(index: number): string {
  return `seed.patient.${String(index + 1).padStart(2, "0")}@${SEED_IDS.patientEmailDomain}`;
}

export function indianPersonName(): { firstName: string; lastName: string } {
  return {
    firstName: seedFaker.person.firstName(),
    lastName: seedFaker.person.lastName(),
  };
}

export function indianAddress() {
  const place = seedFaker.helpers.arrayElement(INDIAN_CITIES);
  const sector = seedFaker.helpers.arrayElement(STREET_PREFIXES);
  const house = seedFaker.number.int({ min: 12, max: 420 });

  return {
    line1: `${house}, ${sector}`,
    line2: seedFaker.helpers.maybe(() => `Near ${seedFaker.company.name()}`, {
      probability: 0.45,
    }) ?? null,
    city: place.city,
    state: place.state,
    postalCode: place.postal,
    country: "IN" as const,
  };
}

export function randomGender() {
  return seedFaker.helpers.arrayElement([...GENDER_VALUES]);
}

export function randomBloodGroup() {
  return seedFaker.helpers.arrayElement([...BLOOD_GROUP_VALUES]);
}

export function randomRelationship() {
  return seedFaker.helpers.arrayElement([
    ...EMERGENCY_CONTACT_RELATIONSHIP_VALUES,
  ]);
}

export function randomDob(minAge = 8, maxAge = 72): Date {
  return seedFaker.date.birthdate({ min: minAge, max: maxAge, mode: "age" });
}

export function toCanonicalPhone(phone: string): string {
  return normalizePhone(phone);
}

export function padSeedIndex(index: number, width = 3): string {
  return String(index).padStart(width, "0");
}
