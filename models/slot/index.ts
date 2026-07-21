import "server-only";

import { getOrCreateModel } from "@/models/base";

import { slotSchema } from "./schema";
import type { SlotDocument, SlotModel } from "./types";

export const SLOT_MODEL_NAME = "Slot";

/**
 * Slot model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Slot = getOrCreateModel<SlotDocument>(
  SLOT_MODEL_NAME,
  slotSchema,
) as SlotModel;

export type { LeanSlot, SlotDocument, SlotFields, SlotModel } from "./types";
export { APPOINTMENT_MODEL_NAME, slotSchema } from "./schema";
