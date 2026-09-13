/**
 * Centralized public-booking rate limit defaults.
 * Override with environment variables — do not scatter magic numbers.
 */

export const BOOKING_RATE_LIMIT_DEFAULTS = {
  IP_MAX: 8,
  IP_WINDOW_SEC: 60,
  EMAIL_MAX: 5,
  EMAIL_WINDOW_SEC: 600,
  PHONE_MAX: 5,
  PHONE_WINDOW_SEC: 600,
} as const;

export type BookingRateLimitBucketConfig = {
  max: number;
  windowSec: number;
};

export type BookingRateLimitConfig = {
  ip: BookingRateLimitBucketConfig;
  email: BookingRateLimitBucketConfig;
  phone: BookingRateLimitBucketConfig;
};
