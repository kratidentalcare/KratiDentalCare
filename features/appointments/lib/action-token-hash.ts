import { createHash } from "node:crypto";

/**
 * Stable hash for appointment email action tokens.
 * Optional EMAIL_ACTION_SECRET peppers the material.
 */
export function hashActionToken(rawToken: string): string {
  const pepper = process.env.EMAIL_ACTION_SECRET?.trim() ?? "";
  const material = pepper ? `${pepper}:${rawToken}` : rawToken;
  return createHash("sha256").update(material).digest("hex");
}
