import type { ClerkUserSyncInput } from "./types";

type WebhookVerification = {
  status: string;
} | null;

type WebhookEmailAddress = {
  id: string;
  email_address: string;
  verification: WebhookVerification;
};

type WebhookPhoneNumber = {
  id: string;
  phone_number: string;
  verification: WebhookVerification;
};

/**
 * Clerk `user.created` / `user.updated` webhook body (snake_case).
 * Structural subset of Clerk `UserJSON` used by sync.
 */
export type ClerkWebhookUserPayload = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  email_addresses: WebhookEmailAddress[];
  phone_numbers: WebhookPhoneNumber[];
};

function isVerified(verification: WebhookVerification): boolean {
  return verification?.status === "verified";
}

function resolveWebhookEmail(user: ClerkWebhookUserPayload) {
  const primary = user.email_addresses.find(
    (address) => address.id === user.primary_email_address_id,
  );

  if (primary?.email_address.trim()) {
    return primary;
  }

  return (
    user.email_addresses.find(
      (address) => address.email_address.trim() !== "",
    ) ?? null
  );
}

function resolveWebhookPhone(user: ClerkWebhookUserPayload) {
  const primary = user.phone_numbers.find(
    (phone) => phone.id === user.primary_phone_number_id,
  );

  if (primary?.phone_number.trim()) {
    return primary;
  }

  return (
    user.phone_numbers.find((phone) => phone.phone_number.trim() !== "") ?? null
  );
}

/**
 * Maps a Clerk user webhook payload into the sync DTO.
 * Clerk-owned fields only — role and access stay application-managed.
 */
export function toClerkWebhookUserSyncInput(
  user: ClerkWebhookUserPayload,
): ClerkUserSyncInput {
  const emailAddress = resolveWebhookEmail(user);
  const phoneNumber = resolveWebhookPhone(user);

  return {
    clerkId: user.id,
    email: emailAddress?.email_address ?? null,
    firstName: user.first_name,
    lastName: user.last_name,
    phoneNumber: phoneNumber?.phone_number ?? null,
    profileImage: user.image_url || null,
    emailVerified: isVerified(emailAddress?.verification ?? null),
    phoneVerified: isVerified(phoneNumber?.verification ?? null),
  };
}
