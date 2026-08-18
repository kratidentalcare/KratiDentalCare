"use client";

import { useEffect, useRef, useState } from "react";

export type InViewRevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

/**
 * Scroll-enter reveal. Unmeasured nodes stay visible so above-the-fold
 * content does not flash blank before IntersectionObserver runs.
 * Only applies the hidden state after the observer confirms off-screen.
 */
export function useInViewReveal<T extends HTMLElement = HTMLElement>(
  options: InViewRevealOptions = {},
) {
  const { threshold = 0.12, rootMargin = "0px 0px -24px 0px" } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
          return;
        }

        setVisible((current) => (current === true ? true : false));
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, visible: visible !== false } as const;
}
