"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/utils";

import { SliderHandle } from "./slider-handle";

export type BeforeAfterSliderProps = {
  beforeImage: string;
  afterImage: string;
  patientName: string;
  className?: string;
  /** Reset key — change when switching testimonials to restore the midpoint. */
  resetKey?: string;
};

/**
 * Custom horizontal before/after image comparison.
 * Built with React state + pointer events (no third-party comparison library).
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  patientName,
  className,
  resetKey,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const labelId = useId();
  const [position, setPosition] = useState(50);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    setPosition(50);
    setImageReady(false);
  }, [resetKey]);

  const updatePosition = useCallback((clientX: number) => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;

    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePosition(event.clientX);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updatePosition(event.clientX);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((prev) => Math.max(0, prev - step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((prev) => Math.min(100, prev + step));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)}% before, ${Math.round(100 - position)}% after`}
      aria-labelledby={labelId}
      className={cn(
        "group relative aspect-[4/3] w-full cursor-ew-resize touch-none overflow-hidden",
        "rounded-2xl bg-brand-surface ring-1 ring-brand-blue/10",
        "shadow-[0_20px_50px_color-mix(in_srgb,var(--brand-blue)_12%,transparent)]",
        "outline-none transition-shadow duration-300",
        "focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
        "sm:rounded-3xl sm:aspect-[16/10]",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <span id={labelId} className="sr-only">
        Before and after smile comparison for {patientName}. Use arrow keys or
        drag to compare.
      </span>

      {/* After (full base layer) */}
      <Image
        src={afterImage}
        alt={`${patientName} — smile after treatment`}
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        className={cn(
          "object-cover transition-opacity duration-500 ease-out",
          imageReady ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setImageReady(true)}
        priority
      />

      {/* Before (clipped to the left of the divider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden
      >
        <Image
          src={beforeImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className={cn(
            "object-cover transition-opacity duration-500 ease-out",
            imageReady ? "opacity-100" : "opacity-0"
          )}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span
        className={cn(
          "pointer-events-none absolute top-3 left-3 z-10",
          "rounded-full bg-black/45 px-2.5 py-1",
          "text-[0.625rem] font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm",
          "sm:top-4 sm:left-4 sm:px-3 sm:text-[0.6875rem]"
        )}
      >
        Before
      </span>
      <span
        className={cn(
          "pointer-events-none absolute top-3 right-3 z-10",
          "rounded-full bg-brand-teal/90 px-2.5 py-1",
          "text-[0.625rem] font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm",
          "sm:top-4 sm:right-4 sm:px-3 sm:text-[0.6875rem]"
        )}
      >
        After
      </span>

      {/* Divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-20"
        style={{ left: `${position}%` }}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-sm sm:w-1" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <SliderHandle
            className={cn(
              "transition-transform duration-200 ease-out",
              "group-active:scale-105"
            )}
          />
        </div>
      </div>
    </div>
  );
}
