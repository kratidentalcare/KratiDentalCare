"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ContactMapEmbedProps = {
  embedUrl: string;
  title: string;
};

/**
 * Maps iframe with a muted skeleton until the embed reports `load`.
 */
export function ContactMapEmbed({ embedUrl, title }: ContactMapEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
      {loaded ? null : (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      <iframe
        title={title}
        src={embedUrl}
        className={cn(
          "absolute inset-0 size-full border-0 transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
