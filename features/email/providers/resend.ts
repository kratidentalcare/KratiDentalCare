import "server-only";

import { Resend } from "resend";

import { EMAIL_PROVIDERS } from "@/constants/email";

import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

export function createResendEmailProvider(apiKey: string): EmailProvider {
  const client = new Resend(apiKey);

  return {
    name: EMAIL_PROVIDERS.RESEND,
    async send(input: SendEmailInput): Promise<SendEmailResult> {
      const from = process.env.EMAIL_FROM?.trim();
      if (!from) {
        return {
          ok: false,
          messageId: null,
          error: "EMAIL_FROM is not configured",
        };
      }

      try {
        const { data, error } = await client.emails.send({
          from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
          tags: input.tags?.map((name) => ({ name, value: "true" })),
        });

        if (error) {
          return {
            ok: false,
            messageId: null,
            error: error.message || "Resend send failed",
          };
        }

        return {
          ok: true,
          messageId: data?.id ?? null,
          error: null,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Resend send failed";
        return { ok: false, messageId: null, error: message };
      }
    },
  };
}
