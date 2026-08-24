import "server-only";

import { getOrCreateModel } from "@/models/base";

import { MEDICINE_MODEL_NAME } from "./constants";
import { medicineSchema } from "./schema";
import type { MedicineDocument, MedicineModel } from "./types";

/**
 * Medicine library model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Medicine = getOrCreateModel<MedicineDocument>(
  MEDICINE_MODEL_NAME,
  medicineSchema,
) as MedicineModel;

export type {
  LeanMedicine,
  MedicineDocument,
  MedicineFields,
  MedicineModel,
} from "./types";
export { MEDICINE_MODEL_NAME } from "./constants";
export { medicineSchema } from "./schema";
