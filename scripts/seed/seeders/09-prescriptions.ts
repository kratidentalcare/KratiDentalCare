import { Types } from "mongoose";

import { PRESCRIPTION_STATUSES } from "@/constants/statuses";
import { Appointment } from "@/models/appointment";
import { Prescription } from "@/models/prescription";
import type { LeanPatient } from "@/models/patient";

import { SEED_IDS } from "../config";
import type { SeedContext } from "../lib/context";
import { padSeedIndex, seedFaker } from "../lib/indian-data";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

const DIAGNOSES = [
  "Dental caries — posterior tooth",
  "Chronic gingivitis",
  "Irreversible pulpitis",
  "Apical periodontitis",
  "Tooth sensitivity — enamel wear",
  "Mild periodontitis",
] as const;

const ADVICE = [
  "Maintain twice-daily brushing with a soft brush.",
  "Rinse with warm salt water twice daily for 3 days.",
  "Avoid hard/sticky foods on the treated side for 48 hours.",
  "Return sooner if pain, swelling, or fever develops.",
] as const;

const MEDICATION_POOL = [
  {
    name: "Amoxicillin",
    dosage: "500 mg",
    frequency: "Thrice daily",
    duration: "5 days",
    route: "Oral",
    instructions: "After meals",
    quantity: "15 capsules",
  },
  {
    name: "Ibuprofen",
    dosage: "400 mg",
    frequency: "Twice daily",
    duration: "3 days",
    route: "Oral",
    instructions: "After food if needed for pain",
    quantity: "6 tablets",
  },
  {
    name: "Paracetamol",
    dosage: "650 mg",
    frequency: "Thrice daily",
    duration: "3 days",
    route: "Oral",
    instructions: "As needed for pain/fever",
    quantity: "9 tablets",
  },
  {
    name: "Chlorhexidine mouthwash",
    dosage: "0.2%",
    frequency: "Twice daily",
    duration: "7 days",
    route: "Topical",
    instructions: "Rinse for 30 seconds; do not swallow",
    quantity: "1 bottle",
  },
  {
    name: "Metronidazole",
    dosage: "400 mg",
    frequency: "Thrice daily",
    duration: "5 days",
    route: "Oral",
    instructions: "After meals",
    quantity: "15 tablets",
  },
] as const;

function ageYearsFromDob(dob: Date | null | undefined, at: Date): number | null {
  if (!dob) {
    return null;
  }
  let age = at.getUTCFullYear() - dob.getUTCFullYear();
  const m = at.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && at.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

function patientById(
  patients: SeedContext["patients"],
  id: Types.ObjectId,
): LeanPatient & { _id: Types.ObjectId } {
  const found = patients.find((p) => String(p._id) === String(id));
  if (!found) {
    throw new Error(`Seed patient not found for prescription: ${String(id)}`);
  }
  return found;
}

export async function seedPrescriptions(ctx: SeedContext): Promise<void> {
  let count = 0;

  for (let i = 0; i < ctx.completedAppointmentIds.length; i += 1) {
    const appointmentId = ctx.completedAppointmentIds[i]!;
    const appointment = await Appointment.findById(appointmentId).lean();
    if (!appointment) {
      continue;
    }

    const patient = patientById(ctx.patients, appointment.patientId);
    const issuedAt = appointment.completedAt ?? appointment.endsAt;
    const validUntil = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const prescriptionNumber = `${SEED_IDS.prescriptionNumberPrefix}${padSeedIndex(i + 1)}`;
    const medications = seedFaker.helpers.arrayElements([...MEDICATION_POOL], {
      min: 1,
      max: 3,
    });

    await upsertOne(
      Prescription,
      { appointmentId },
      {
        prescriptionNumber,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId,
        status: PRESCRIPTION_STATUSES.ISSUED,
        diagnosis: seedFaker.helpers.arrayElement([...DIAGNOSES]),
        chiefComplaint: appointment.reason,
        clinicalNotes: "Demo seed prescription linked to completed visit.",
        advice: seedFaker.helpers.arrayElement([...ADVICE]),
        followUpDate: new Date(issuedAt.getTime() + 14 * 24 * 60 * 60 * 1000),
        medications,
        issuedAt,
        validUntil,
        pdfUrl: null,
        pdfPublicId: null,
        patientSnapshot: {
          fullName: patient.fullName,
          phone: patient.phone,
          ageYears: ageYearsFromDob(patient.dateOfBirth, issuedAt),
          gender: patient.gender,
        },
        doctorSnapshot: {
          fullName: ctx.doctor.fullName,
          qualification: ctx.doctor.qualification,
        },
        createdByUserId: ctx.doctorUser._id,
        voidReason: null,
        voidedAt: null,
        voidedByUserId: null,
        supersedesPrescriptionId: null,
      },
    );

    count += 1;
  }

  logOk(`Prescriptions Seeded (${count})`);
}
