import "server-only";

import { getBookingRateLimitConfig } from "@/config/env";
import { BOOKING_RATE_LIMIT_MESSAGE } from "@/constants/appointments";
import { normalizeEmail } from "@/features/patients/lib/email";
import { toCanonicalPhone } from "@/features/patients/lib/phone";
import { connect } from "@/lib/db";
import { RateLimitError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { isLimitExceeded, windowStartFor } from "@/lib/rate-limit/window";
import { RateLimitHit } from "@/models/rate-limit-hit";

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return headers.get("cf-connecting-ip")?.trim() || "unknown";
}

async function consumeBucket(
  key: string,
  max: number,
  windowSec: number,
  now: Date,
  keyType: "ip" | "email" | "phone",
): Promise<void> {
  const windowStart = windowStartFor(now, windowSec);
  const expiresAt = new Date(windowStart.getTime() + windowSec * 1000);

  const hit = await RateLimitHit.findOneAndUpdate(
    { key, windowStart },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt },
    },
    { upsert: true, returnDocument: "after" },
  );

  const count = hit?.count ?? 1;
  if (isLimitExceeded(count, max)) {
    logger.warn("booking_rate_limited", { keyType });
    throw new RateLimitError(BOOKING_RATE_LIMIT_MESSAGE);
  }
}

export async function enforcePublicBookingRateLimit(input: {
  headers: Headers;
  email?: string | null;
  phone: string;
  now?: Date;
}): Promise<void> {
  await connect();

  const config = getBookingRateLimitConfig();
  const now = input.now ?? new Date();
  const ip = getClientIp(input.headers);

  await consumeBucket(
    `booking:ip:${ip}`,
    config.ip.max,
    config.ip.windowSec,
    now,
    "ip",
  );

  const email = normalizeEmail(input.email);
  if (email) {
    await consumeBucket(
      `booking:email:${email}`,
      config.email.max,
      config.email.windowSec,
      now,
      "email",
    );
  }

  const phone = toCanonicalPhone(input.phone);
  if (phone) {
    await consumeBucket(
      `booking:phone:${phone}`,
      config.phone.max,
      config.phone.windowSec,
      now,
      "phone",
    );
  }
}
