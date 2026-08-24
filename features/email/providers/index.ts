import "server-only";

import { EMAIL_PROVIDERS, type EmailProviderName } from "@/constants/email";

import { createConsoleEmailProvider } from "./console";
import { createResendEmailProvider } from "./resend";
import type { EmailProvider } from "./types";

export type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

function resolveProviderName(): EmailProviderName {
  const raw = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (raw === EMAIL_PROVIDERS.RESEND) {
    return EMAIL_PROVIDERS.RESEND;
  }
  if (raw === EMAIL_PROVIDERS.CONSOLE) {
    return EMAIL_PROVIDERS.CONSOLE;
  }
  return EMAIL_PROVIDERS.CONSOLE;
}

/**
 * Resolves the configured email provider.
 * Falls back to console when Resend is selected but the API key is missing
 * so development never crashes on missing credentials.
 */
export function getEmailProvider(): EmailProvider {
  const name = resolveProviderName();
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (name === EMAIL_PROVIDERS.RESEND && apiKey) {
    return createResendEmailProvider(apiKey);
  }

  if (name === EMAIL_PROVIDERS.RESEND && !apiKey) {
    console.warn(
      "[email] EMAIL_PROVIDER=resend but RESEND_API_KEY is missing; using console provider",
    );
  }

  return createConsoleEmailProvider();
}
