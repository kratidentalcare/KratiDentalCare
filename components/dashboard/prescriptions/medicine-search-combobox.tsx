"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { Input } from "@/components/ui/input";
import { searchMedicinesAction } from "@/features/medicines/actions";
import type { MedicineSearchHit } from "@/features/medicines/types";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 10;
const LIST_MAX_HEIGHT_PX = 224; // ~max-h-56
const VIEWPORT_GAP_PX = 8;

type MedicineSearchComboboxProps = {
  id: string;
  value: string;
  invalid?: boolean;
  onNameChange: (name: string) => void;
  onSelectCatalog: (hit: MedicineSearchHit) => void;
  onUseCustom: () => void;
};

type ListPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function MedicineSearchCombobox({
  id,
  value,
  invalid,
  onNameChange,
  onSelectCatalog,
  onUseCustom,
}: MedicineSearchComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<MedicineSearchHit[]>([]);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState(value);
  const [position, setPosition] = useState<ListPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(value);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    void searchMedicinesAction({
      query: debouncedQuery,
      limit: SEARCH_LIMIT,
    }).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.success) {
        setHits(result.data);
        setHighlight(0);
      } else {
        setHits([]);
      }
      setLoadedQuery(debouncedQuery);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function updatePosition() {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      const rect = root.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP_PX;
      const spaceAbove = rect.top - VIEWPORT_GAP_PX;
      const openUpward =
        spaceBelow < LIST_MAX_HEIGHT_PX / 2 && spaceAbove > spaceBelow;
      const available = openUpward ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(
        120,
        Math.min(LIST_MAX_HEIGHT_PX, available),
      );

      setPosition({
        top: openUpward
          ? Math.max(VIEWPORT_GAP_PX, rect.top - 4 - maxHeight)
          : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, hits.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const loading = open && loadedQuery !== debouncedQuery;
  const optionCount = hits.length + 1;
  const customIndex = hits.length;

  const statusLabel = useMemo(() => {
    if (loading) {
      return "Searching medicines";
    }
    if (hits.length === 0) {
      return "No medicine found.";
    }
    return `${hits.length} medicines`;
  }, [hits.length, loading]);

  function selectHighlight() {
    if (highlight >= hits.length) {
      onUseCustom();
      setOpen(false);
      return;
    }
    const hit = hits[highlight];
    if (hit) {
      onSelectCatalog(hit);
      setOpen(false);
    }
  }

  const listbox =
    open && mounted && position
      ? createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className="z-[200] overflow-y-auto overscroll-contain rounded-lg bg-popover text-sm shadow-lg ring-1 ring-foreground/10"
            onWheel={(event) => {
              // Keep wheel scrolling inside the list (don't scroll the page).
              event.stopPropagation();
            }}
          >
            <p className="sr-only" aria-live="polite">
              {statusLabel}
            </p>
            <div className="p-1">
              {loading ? (
                <p className="px-2 py-2 text-muted-foreground">Searching…</p>
              ) : hits.length === 0 ? (
                <p className="px-2 py-2 text-muted-foreground">
                  {value.trim()
                    ? "No medicine found."
                    : "Type to search the medicine library."}
                </p>
              ) : (
                hits.map((hit, index) => (
                  <button
                    key={hit.id}
                    type="button"
                    role="option"
                    aria-selected={highlight === index}
                    className={cn(
                      "flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left",
                      highlight === index
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/60",
                    )}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => {
                      onSelectCatalog(hit);
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium">{hit.name}</span>
                    {hit.genericName ? (
                      <span className="text-xs text-muted-foreground">
                        {hit.genericName}
                      </span>
                    ) : null}
                  </button>
                ))
              )}
              <button
                type="button"
                role="option"
                aria-selected={highlight === customIndex}
                className={cn(
                  "mt-1 flex w-full rounded-md px-2 py-1.5 text-left font-medium text-brand-blue",
                  highlight === customIndex
                    ? "bg-accent"
                    : "hover:bg-accent/60",
                )}
                onMouseEnter={() => setHighlight(customIndex)}
                onClick={() => {
                  onUseCustom();
                  setOpen(false);
                }}
              >
                {hits.length === 0 && value.trim()
                  ? "Add as Custom Medicine"
                  : "+ Add Custom Medicine"}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid}
        placeholder="Search or type a medicine"
        value={value}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onNameChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setHighlight((current) => (current + 1) % optionCount);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setHighlight((current) =>
              current === 0 ? optionCount - 1 : current - 1,
            );
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            selectHighlight();
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {listbox}
    </div>
  );
}
