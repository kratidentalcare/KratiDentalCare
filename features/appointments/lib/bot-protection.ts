import { ValidationError } from "@/lib/errors";

/**
 * Lightweight public-booking bot guards.
 * CAPTCHA/Turnstile can plug into `assertPublicBookingBotProtection` later.
 */

export function isHoneypotTriggered(website?: string | null): boolean {
  return Boolean(website && website.trim() !== "");
}

export function assertPublicBookingBotProtection(input: {
  website?: string | null;
  captchaToken?: string | null;
}): void {
  void input.captchaToken;
  if (isHoneypotTriggered(input.website)) {
    throw new ValidationError("Unable to submit booking");
  }
}
