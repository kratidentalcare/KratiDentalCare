import type { Metadata } from "next";

import { APP_NAME } from "@/constants/app";

/**
 * Build page metadata that inherits the public layout template (`%s | APP_NAME`)
 * and fills Open Graph + Twitter consistently.
 */
export function createPublicPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const absoluteTitle = `${input.title} | ${APP_NAME}`;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path,
    },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title: absoluteTitle,
      description: input.description,
      url: input.path,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description: input.description,
    },
  };
}
