import {
  APPOINTMENT_EVENT_TYPES,
  type AppointmentEventType,
} from "@/constants/appointments";
import { EMAIL_TYPES, type EmailType } from "@/constants/email";

export function mapEventToEmailType(
  eventType: AppointmentEventType,
): EmailType | null {
  switch (eventType) {
    case APPOINTMENT_EVENT_TYPES.CREATED:
      return EMAIL_TYPES.ADMIN_NEW_APPOINTMENT;
    case APPOINTMENT_EVENT_TYPES.CONFIRMED:
      return EMAIL_TYPES.PATIENT_APPROVED;
    case APPOINTMENT_EVENT_TYPES.CANCELLED:
      return EMAIL_TYPES.PATIENT_CANCELLED;
    case APPOINTMENT_EVENT_TYPES.RESCHEDULED:
      return EMAIL_TYPES.PATIENT_RESCHEDULED;
    default:
      return null;
  }
}
