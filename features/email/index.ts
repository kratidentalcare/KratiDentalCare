export { getEmailProvider } from "./providers";
export type {
  EmailProvider,
  SendEmailInput,
  SendEmailResult,
} from "./providers";
export { sendEmail } from "./services/send-email";
export {
  getClinicEmailBranding,
  getAppBaseUrlForEmail,
} from "./lib/clinic-branding";
export type { ClinicEmailBranding } from "./lib/branding-types";
