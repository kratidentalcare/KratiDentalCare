import type { Types } from "mongoose";

import { WEEKDAYS } from "@/constants/doctor";
import { USER_ROLES } from "@/constants/roles";
import { DOCTOR_STATUSES } from "@/constants/statuses";
import { Doctor } from "@/models/doctor";
import { User } from "@/models/user";

import { SEED_IDS } from "../config";
import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

export async function seedDoctor(ctx: SeedContext): Promise<void> {
  const { doc: doctorUser } = await upsertOne(
    User,
    { clerkId: SEED_IDS.doctorClerkId },
    {
      clerkId: SEED_IDS.doctorClerkId,
      email: SEED_IDS.doctorEmail,
      firstName: "Gaurav",
      lastName: "Jaiswal",
      phoneNumber: "+91 98765 43210",
      role: USER_ROLES.DOCTOR,
      profileImage: null,
      lastLoginAt: null,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    },
  );

  ctx.doctorUser = doctorUser.toObject() as SeedContext["doctorUser"];
  ctx.doctorUser._id = doctorUser._id as Types.ObjectId;

  const { doc: doctor } = await upsertOne(
    Doctor,
    { slug: SEED_IDS.doctorSlug },
    {
      userId: doctorUser._id,
      fullName: "Dr. Gaurav Jaiswal",
      slug: SEED_IDS.doctorSlug,
      specialties: [
        "General Dentistry",
        "Cosmetic Dentistry",
        "Root Canal Treatment",
      ],
      qualification: "BDS · Dental Surgeon",
      registrationNumber: SEED_IDS.doctorRegistration,
      yearsOfExperience: 15,
      consultationFee: 500,
      bio: "Compassionate dental care with a focus on painless treatments, preventive dentistry, and long-term oral health for families in Lucknow.",
      languages: ["Hindi", "English"],
      workingDays: [
        WEEKDAYS.MONDAY,
        WEEKDAYS.TUESDAY,
        WEEKDAYS.WEDNESDAY,
        WEEKDAYS.THURSDAY,
        WEEKDAYS.FRIDAY,
        WEEKDAYS.SATURDAY,
      ],
      consultationDuration: 30,
      startTime: "10:00",
      endTime: "19:00",
      profilePhoto: "/images/hero/drgaurav.png",
      isAvailable: true,
      status: DOCTOR_STATUSES.ACTIVE,
      displayOrder: 1,
      isActive: true,
    },
  );

  ctx.doctor = doctor.toObject() as SeedContext["doctor"];
  ctx.doctor._id = doctor._id as Types.ObjectId;

  logOk("Doctor Seeded");
}
