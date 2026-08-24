import "server-only";

import { getEmailProvider } from "@/features/email/providers";
import type {
  SendEmailInput,
  SendEmailResult,
} from "@/features/email/providers/types";

/**
 * Sends an email through the configured provider.
 * Never throws — failures are returned as `{ ok: false, error }`.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  try {
    return await getEmailProvider().send(input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected email send failure";
    console.error("[email] send failed", message);
    return { ok: false, messageId: null, error: message };
  }
}
