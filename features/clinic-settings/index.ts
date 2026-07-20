/**
 * Clinic Settings feature — identity, contact, footer, and default doctor.
 *
 * Scheduling hours / holidays / overrides remain under `features/scheduling`
 * (single source of truth in ClinicSettings + related collections).
 */

export type { ClinicSettingsView } from "./types";
export { toClinicSettingsView } from "./types";
export {
  getPublicFooterData,
  mapClinicSettingsToFooter,
} from "./services/map-footer-data";
