import "server-only";

import { Resend } from "resend";

import { EMAIL_PROVIDERS } from "@/constants/email";
import { normalizeEmailFrom } from "@/features/email/lib/from-address";

import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

export function createResendEmailProvider(apiKey: string): EmailProvider {
  const client = new Resend(apiKey);

  return {
    name: EMAIL_PROVIDERS.RESEND,
    async send(input: SendEmailInput): Promise<SendEmailResult> {
      const from = normalizeEmailFrom(process.env.EMAIL_FROM);
      if (!from) {
        return {
          ok: false,
          messageId: null,
          error:
            "EMAIL_FROM is missing or invalid. Use email@domain.com or Name <email@domain.com>.",
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
