import { CLINIC_SETTINGS_KEY } from "@/constants/app";
import { Appointment } from "@/models/appointment";
import { ClinicSettings } from "@/models/clinic-settings";
import { Doctor } from "@/models/doctor";
import { Faq } from "@/models/faq";
import { Holiday } from "@/models/holiday";
import { Patient } from "@/models/patient";
import { Prescription } from "@/models/prescription";
import { ScheduleOverride } from "@/models/schedule-override";
import { User } from "@/models/user";

import { SEED_IDS } from "./config";
import { connectForSeed, disconnectSeed } from "./lib/connect";
import { logBlank, logError, logInfo, logOk } from "./lib/log";

/**
 * Deletes only demo/seed-marked documents. Never drops collections.
 * Clinic settings singleton links are cleared, not deleted.
 */
async function main(): Promise<void> {
  const connection = await connectForSeed("reset");
  logInfo(`Connected to MongoDB database: ${connection.dbName}`);
  logInfo("Resetting demo seed data only…");
  logBlank();

  const seedUserIds = await User.find({
    clerkId: {
      $in: [SEED_IDS.adminClerkId, SEED_IDS.doctorClerkId],
    },
  }).distinct("_id");

  const appointmentFilter = {
    bookingReference: {
      $regex: `^${SEED_IDS.appointmentBookingPrefix}`,
    },
  };

  const seededAppointments = await Appointment.find(appointmentFilter)
    .select({ _id: 1 })
    .lean<{ _id: unknown }[]>();
  const appointmentIds = seededAppointments.map((row) => row._id);

  const rxByAppointment =
    appointmentIds.length > 0
      ? await Prescription.deleteMany({
          appointmentId: { $in: appointmentIds },
        })
      : { deletedCount: 0 };

  const rxByNumber = await Prescription.deleteMany({
    prescriptionNumber: {
      $regex: `^${SEED_IDS.prescriptionNumberPrefix}`,
    },
  });

  const appointments = await Appointment.deleteMany(appointmentFilter);

  const patients = await Patient.deleteMany({
    $or: [
      {
        email: {
          $regex: `@${SEED_IDS.patientEmailDomain}$`,
          $options: "i",
        },
      },
      {
        canonicalPhone: {
          $regex: `^\\+91${String(SEED_IDS.patientPhoneBase).slice(0, 4)}`,
        },
      },
    ],
  });

  const faqs = await Faq.deleteMany({ category: SEED_IDS.faqCategory });

  const holidays = await Holiday.deleteMany({
    $or: [
      { reason: { $regex: "demo seed", $options: "i" } },
      ...(seedUserIds.length > 0
        ? [
            {
              createdBy: { $in: seedUserIds },
              reason: {
                $in: [
                  "Republic Day",
                  "Independence Day",
                  "Gandhi Jayanti",
                  "Diwali — clinic closed",
                ],
              },
            },
          ]
        : []),
    ],
  });

  const overrides = await ScheduleOverride.deleteMany({
    reason: { $regex: "demo seed", $options: "i" },
  });

  const doctors = await Doctor.deleteMany({
    $or: [
      { slug: SEED_IDS.doctorSlug },
      { registrationNumber: SEED_IDS.doctorRegistration },
    ],
  });

  const users = await User.deleteMany({
    clerkId: {
      $in: [SEED_IDS.adminClerkId, SEED_IDS.doctorClerkId],
    },
  });

  await ClinicSettings.updateOne(
    { clinicKey: CLINIC_SETTINGS_KEY },
    {
      $set: {
        defaultDoctorId: null,
        updatedByUserId: null,
      },
    },
  );

  const rxRemoved =
    (rxByAppointment.deletedCount ?? 0) + (rxByNumber.deletedCount ?? 0);

  logOk(`Prescriptions removed (${rxRemoved})`);
  logOk(`Appointments removed (${appointments.deletedCount ?? 0})`);
  logOk(`Patients removed (${patients.deletedCount ?? 0})`);
  logOk(`FAQs removed (${faqs.deletedCount ?? 0})`);
  logOk(`Holidays removed (${holidays.deletedCount ?? 0})`);
  logOk(`Schedule Overrides removed (${overrides.deletedCount ?? 0})`);
  logOk(`Doctors removed (${doctors.deletedCount ?? 0})`);
  logOk(`Users removed (${users.deletedCount ?? 0})`);
  logOk("Clinic Settings demo links cleared");

  logBlank();
  logOk("Demo Seed Reset Complete");
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Unknown seed reset failure";
    logError(message);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectSeed();
  });
