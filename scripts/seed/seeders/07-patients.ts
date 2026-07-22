import type { Types } from "mongoose";

import { PATIENT_STATUSES } from "@/constants/statuses";
import { Patient } from "@/models/patient";

import { SEED_COUNTS } from "../config";
import type { SeedContext } from "../lib/context";
import {
  indianAddress,
  indianMobile,
  indianPersonName,
  patientSeedEmail,
  randomBloodGroup,
  randomDob,
  randomGender,
  randomRelationship,
  seedFaker,
  toCanonicalPhone,
} from "../lib/indian-data";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

const ALLERGIES = [
  "Penicillin",
  "Latex",
  "Lidocaine",
  "Aspirin",
  "Ibuprofen",
] as const;

const CONDITIONS = [
  "Diabetes Type 2",
  "Hypertension",
  "Asthma",
  "Thyroid disorder",
] as const;

export async function seedPatients(ctx: SeedContext): Promise<void> {
  const patients: SeedContext["patients"] = [];

  for (let i = 0; i < SEED_COUNTS.patients; i += 1) {
    const { firstName, lastName } = indianPersonName();
    const phone = indianMobile(i);
    const canonicalPhone = toCanonicalPhone(phone);
    const email = patientSeedEmail(i);
    const hasEmergency = seedFaker.datatype.boolean({ probability: 0.7 });
    const emergencyName = hasEmergency
      ? `${seedFaker.person.firstName()} ${seedFaker.person.lastName()}`
      : null;
    const emergencyPhone = hasEmergency
      ? toCanonicalPhone(indianMobile(100 + i))
      : null;

    const { doc } = await upsertOne(
      Patient,
      { canonicalPhone },
      {
        userId: null,
        fullName: `${firstName} ${lastName}`,
        phone,
        canonicalPhone,
        email,
        gender: randomGender(),
        dateOfBirth: randomDob(),
        bloodGroup: randomBloodGroup(),
        address: indianAddress(),
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        relationship: hasEmergency ? randomRelationship() : null,
        allergies: seedFaker.helpers.arrayElements([...ALLERGIES], {
          min: 0,
          max: 2,
        }),
        chronicConditions: seedFaker.helpers.arrayElements([...CONDITIONS], {
          min: 0,
          max: 2,
        }),
        medicalNotes: seedFaker.helpers.maybe(
          () => "Demo seed patient — for local development only.",
          { probability: 0.35 },
        ) ?? null,
        status: PATIENT_STATUSES.ACTIVE,
        isActive: true,
      },
    );

    const lean = doc.toObject() as SeedContext["patients"][number];
    lean._id = doc._id as Types.ObjectId;
    patients.push(lean);
  }

  ctx.patients = patients;
  logOk(`Patients Seeded (${patients.length})`);
}
