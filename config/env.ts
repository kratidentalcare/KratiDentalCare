import "server-only";

import { z } from "zod";

import { ConfigurationError } from "@/lib/errors";

const optionalNonEmpty = z.string().trim().min(1).optional();

const clerkPublishableKeySchema = optionalNonEmpty.refine(
  (value) => value === undefined || value.startsWith("pk_"),
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_",
);

const clerkSecretKeySchema = optionalNonEmpty.refine(
  (value) => value === undefined || value.startsWith("sk_"),
  "CLERK_SECRET_KEY must start with sk_",
);

/**
 * Server-side environment schema.
 * Clerk and Mongo keys are validated when present; required helpers
 * (`requireClerkEnv`, `requireMongoUri`) enforce presence at use sites.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),

  MONGODB_URI: optionalNonEmpty,

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKeySchema,
  CLERK_SECRET_KEY: clerkSecretKeySchema,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1).default("/sign-in"),
  /**
   * Optional. Leave unset for Clerk's combined sign-in-or-up flow
   * (required for modal + OAuth callbacks under `/sign-in`).
   */
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: optionalNonEmpty,
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z
    .string()
    .min(1)
    .optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z
    .string()
    .min(1)
    .optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export type ServerEnv = Env & {
  /** True when MongoDB URI is present and non-empty. */
  hasMongoUri: boolean;
  /** True when both Clerk publishable and secret keys are present. */
  hasClerkKeys: boolean;
};

export type ClerkEnv = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
};

let cachedEnv: ServerEnv | null = null;

function readRawEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };
}

/**
 * Parses and caches validated server environment variables.
 * Safe to call repeatedly (singleton parse).
 */
export function getEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(readRawEnv());

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new ConfigurationError(
      `Invalid environment configuration: ${details}`,
    );
  }

  const data = parsed.data;
  const publishableKey = data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const secretKey = data.CLERK_SECRET_KEY?.trim();

  cachedEnv = {
    ...data,
    hasMongoUri: Boolean(data.MONGODB_URI?.trim()),
    hasClerkKeys: Boolean(publishableKey && secretKey),
  };

  return cachedEnv;
}

/**
 * Returns MONGODB_URI or throws a clear configuration error.
 * Used by the DB connection utility — does not open a connection itself.
 */
export function requireMongoUri(): string {
  const env = getEnv();
  const uri = env.MONGODB_URI?.trim();

  if (!uri) {
    throw new ConfigurationError(
      "MONGODB_URI is not set. Add it to .env.local before connecting to MongoDB.",
    );
  }

  return uri;
}

/**
 * Asserts Clerk keys are configured and returns the validated env slice.
 */
export function requireClerkEnv(): ClerkEnv {
  const env = getEnv();
  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const secretKey = env.CLERK_SECRET_KEY?.trim();

  if (!publishableKey || !secretKey) {
    throw new ConfigurationError(
      "Clerk keys are not set. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env.local.",
    );
  }

  return {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
    CLERK_SECRET_KEY: secretKey,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    ...(env.NEXT_PUBLIC_CLERK_SIGN_UP_URL
      ? { NEXT_PUBLIC_CLERK_SIGN_UP_URL: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL }
      : {}),
  };
}

/**
 * Resets the env cache — intended for tests only.
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}
