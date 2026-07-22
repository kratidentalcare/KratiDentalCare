import { connectForSeed, disconnectSeed } from "./lib/connect";
import { createEmptySeedContext } from "./lib/context";
import { logBlank, logError, logInfo, logOk } from "./lib/log";
import {
  seedAdmin,
  seedAppointments,
  seedClinicSettings,
  seedDoctor,
  seedFaqs,
  seedHolidays,
  seedPatients,
  seedPrescriptions,
  seedScheduleOverrides,
} from "./seeders";

/**
 * Idempotent demo data seeder (Phase 20.1).
 *
 * Order matters — later seeders consume IDs from earlier ones.
 */
async function main(): Promise<void> {
  const connection = await connectForSeed("seed");
  logInfo(`Connected to MongoDB database: ${connection.dbName}`);
  logBlank();

  const ctx = createEmptySeedContext();

  await seedAdmin(ctx);
  await seedDoctor(ctx);
  await seedClinicSettings(ctx);
  await seedHolidays(ctx);
  await seedScheduleOverrides(ctx);
  await seedFaqs(ctx);
  await seedPatients(ctx);
  await seedAppointments(ctx);
  await seedPrescriptions(ctx);

  logBlank();
  logOk("Seed Complete");
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Unknown seed failure";
    logError(message);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectSeed();
  });
