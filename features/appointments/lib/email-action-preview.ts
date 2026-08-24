import {
  APPOINTMENT_EMAIL_ACTIONS,
  type AppointmentEmailAction,
} from "@/constants/email";

export function previewEmailActionPage(
  rawToken: string | undefined,
  actionHint: string | undefined,
):
  | { mode: "approve"; token: string }
  | { mode: "cancel_confirm"; token: string }
  | { mode: "invalid" } {
  if (!rawToken?.trim()) {
    return { mode: "invalid" };
  }

  if (actionHint === APPOINTMENT_EMAIL_ACTIONS.CANCEL) {
    return { mode: "cancel_confirm", token: rawToken.trim() };
  }

  if (
    actionHint === APPOINTMENT_EMAIL_ACTIONS.APPROVE ||
    !actionHint
  ) {
    return { mode: "approve", token: rawToken.trim() };
  }

  void (actionHint as AppointmentEmailAction | string);
  return { mode: "invalid" };
}
