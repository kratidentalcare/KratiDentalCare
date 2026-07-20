import "server-only";

import { getOrCreateModel } from "@/models/base";

import { CLINIC_SETTINGS_MODEL_NAME, clinicSettingsSchema } from "./schema";
import type { ClinicSettingsDocument, ClinicSettingsModel } from "./types";

/**
 * ClinicSettings model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const ClinicSettings = getOrCreateModel<ClinicSettingsDocument>(
  CLINIC_SETTINGS_MODEL_NAME,
  clinicSettingsSchema,
) as ClinicSettingsModel;

export type {
  ClinicAddress,
  ClinicBookingRules,
  ClinicBreakWindow,
  ClinicFooterLink,
  ClinicSettingsDocument,
  ClinicSettingsFields,
  ClinicSettingsModel,
  ClinicSocialLinks,
  FooterLinkGroup,
  LeanClinicSettings,
} from "./types";
export {
  CLINIC_SETTINGS_MODEL_NAME,
  clinicSettingsSchema,
} from "./schema";
