import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getEnv } from "@/config/env";
import { ConfigurationError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
};

export type CloudinaryFileUploadResult = CloudinaryUploadResult & {
  bytes: number;
  resourceType: string;
  format: string | null;
};

type UploadImageInput = {
  bytes: Buffer;
  mimeType: string;
  folder: string;
  fileName?: string;
};

type UploadFileInput = {
  bytes: Buffer;
  mimeType: string;
  folder: string;
  fileName?: string;
  /** Basename only (no folder path). Auto-generated when omitted. */
  publicId?: string;
};

type DeleteFileInput = {
  publicId: string;
  resourceType: string;
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

function signParams(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function createUniquePublicIdBasename(): string {
  return `${Date.now()}-${randomBytes(8).toString("hex")}`;
}

/**
 * Inserts a Cloudinary transformation segment into an image delivery URL.
 * Returns null when the URL is not a Cloudinary image upload URL (e.g. PDF/raw).
 */
export function buildCloudinaryThumbnailUrl(
  secureUrl: string,
  options: { width?: number; height?: number } = {},
): string | null {
  const width = options.width ?? 160;
  const height = options.height ?? 160;
  const transform = `c_fill,w_${width},h_${height},f_auto,q_auto`;

  const marker = "/image/upload/";
  const index = secureUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }

  const before = secureUrl.slice(0, index + marker.length);
  const after = secureUrl.slice(index + marker.length);
  return `${before}${transform}/${after}`;
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

  const signature = signParams(signedParams, apiSecret);
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

/**
 * Signed upload via Cloudinary `auto` endpoint (images + PDF/raw).
 */
export async function uploadFileToCloudinary(
  input: UploadFileInput,
): Promise<CloudinaryFileUploadResult> {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();
  const timestamp = String(Math.round(Date.now() / 1000));
  const publicId = input.publicId?.trim() || createUniquePublicIdBasename();

  const signedParams: Record<string, string> = {
    folder: input.folder,
    public_id: publicId,
    timestamp,
  };

  const signature = signParams(signedParams, apiSecret);
  const form = new FormData();
  const blob = new Blob([new Uint8Array(input.bytes)], {
    type: input.mimeType,
  });

  form.append("file", blob, input.fileName ?? "upload");
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", input.folder);
  form.append("public_id", publicId);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    logger.error("Cloudinary file upload request failed", error);
    throw new ValidationError("Unable to upload document right now");
  }

  const payload = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    bytes?: number;
    resource_type?: string;
    format?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    logger.warn("Cloudinary rejected file upload", {
      status: response.status,
      message: payload.error?.message,
    });
    throw new ValidationError(
      payload.error?.message ?? "Document upload failed",
    );
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    bytes: payload.bytes ?? input.bytes.length,
    resourceType: payload.resource_type ?? "auto",
    format: payload.format ?? null,
  };
}

/**
 * Signed destroy of a Cloudinary asset. Throws on failure so callers
 * do not remove Mongo metadata when the remote file still exists.
 */
export async function deleteFileFromCloudinary(
  input: DeleteFileInput,
): Promise<void> {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();
  const timestamp = String(Math.round(Date.now() / 1000));
  const resourceType = input.resourceType.trim() || "image";

  const signedParams: Record<string, string> = {
    public_id: input.publicId,
    timestamp,
  };

  const signature = signParams(signedParams, apiSecret);
  const form = new FormData();
  form.append("public_id", input.publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    logger.error("Cloudinary destroy request failed", error);
    throw new ValidationError("Unable to delete document from storage");
  }

  const payload = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  // "not found" is treated as success so orphaned DB rows can still be cleaned up
  // after a prior partial failure — but "error" responses are not.
  if (!response.ok) {
    logger.warn("Cloudinary rejected destroy", {
      status: response.status,
      message: payload.error?.message,
      publicId: input.publicId,
    });
    throw new ValidationError(
      payload.error?.message ?? "Document storage delete failed",
    );
  }

  const result = payload.result?.toLowerCase();
  if (result && result !== "ok" && result !== "not found") {
    logger.warn("Cloudinary destroy returned unexpected result", {
      result: payload.result,
      publicId: input.publicId,
    });
    throw new ValidationError("Document storage delete failed");
  }
}
