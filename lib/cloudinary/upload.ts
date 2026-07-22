import "server-only";

import { createHash } from "node:crypto";

import { getEnv } from "@/config/env";
import { ConfigurationError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
};

type UploadImageInput = {
  bytes: Buffer;
  mimeType: string;
  folder: string;
  fileName?: string;
};

/**
 * True when Cloudinary credentials are fully configured.
 */
export function isCloudinaryConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME?.trim() &&
      env.CLOUDINARY_API_KEY?.trim() &&
      env.CLOUDINARY_API_SECRET?.trim(),
  );
}

function requireCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} {
  const env = getEnv();
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ConfigurationError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function signUploadParams(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

/**
 * Server-side signed image upload to Cloudinary (no SDK dependency).
 * Used when Cloudinary env vars are present.
 */
export async function uploadImageToCloudinary(
  input: UploadImageInput,
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();
  const timestamp = String(Math.round(Date.now() / 1000));

  const signedParams: Record<string, string> = {
    folder: input.folder,
    timestamp,
  };

  const signature = signUploadParams(signedParams, apiSecret);
  const form = new FormData();
  const blob = new Blob([new Uint8Array(input.bytes)], {
    type: input.mimeType,
  });

  form.append("file", blob, input.fileName ?? "upload");
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", input.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    logger.error("Cloudinary upload request failed", error);
    throw new ValidationError("Unable to upload profile image right now");
  }

  const payload = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    logger.warn("Cloudinary rejected image upload", {
      status: response.status,
      message: payload.error?.message,
    });
    throw new ValidationError(
      payload.error?.message ?? "Profile image upload failed",
    );
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
  };
}
