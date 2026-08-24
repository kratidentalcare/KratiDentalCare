/**
 * Shared formatting helpers for patient document DTOs.
 */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileExtensionFromName(
  fileName: string | null | undefined,
  mimeType: string,
): string {
  if (fileName) {
    const index = fileName.lastIndexOf(".");
    if (index >= 0) {
      return fileName.slice(index + 1).toUpperCase();
    }
  }

  if (mimeType === "application/pdf") {
    return "PDF";
  }
  if (mimeType === "image/jpeg") {
    return "JPG";
  }
  if (mimeType === "image/png") {
    return "PNG";
  }
  if (mimeType === "image/webp") {
    return "WEBP";
  }
  return "FILE";
}

export function formatUploaderName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (name) {
    return name;
  }
  return email?.trim() || "Unknown user";
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
