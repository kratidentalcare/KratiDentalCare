import "server-only";

import { EMAIL_PROVIDERS } from "@/constants/email";

import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

/**
 * Development provider — logs a safe summary without secrets or full HTML bodies.
 */
export function createConsoleEmailProvider(): EmailProvider {
  return {
    name: EMAIL_PROVIDERS.CONSOLE,
    async send(input: SendEmailInput): Promise<SendEmailResult> {
      const messageId = `console_${Date.now().toString(36)}`;
      console.info("[email:console]", {
        messageId,
        to: input.to,
        subject: input.subject,
        htmlBytes: Buffer.byteLength(input.html, "utf8"),
        textBytes: Buffer.byteLength(input.text, "utf8"),
        tags: input.tags ?? [],
      });
      return { ok: true, messageId, error: null };
    },
  };
}
