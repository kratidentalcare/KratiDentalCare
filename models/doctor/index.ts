import "server-only";

import { getOrCreateModel } from "@/models/base";

import { doctorSchema } from "./schema";
import type { DoctorDocument, DoctorModel } from "./types";

export const DOCTOR_MODEL_NAME = "Doctor";

/**
 * Doctor model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Doctor = getOrCreateModel<DoctorDocument>(
  DOCTOR_MODEL_NAME,
  doctorSchema,
) as DoctorModel;

export type {
  DoctorDocument,
  DoctorFields,
  DoctorModel,
  LeanDoctor,
} from "./types";
export { doctorSchema } from "./schema";
