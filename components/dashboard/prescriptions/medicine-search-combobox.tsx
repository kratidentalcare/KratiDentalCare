"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchMedicinesAction } from "@/features/medicines/actions";
import type { MedicineSearchHit } from "@/features/medicines/types";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 10;

type MedicineSearchComboboxProps = {
  id: string;
  value: string;
  invalid?: boolean;
  onNameChange: (name: string) => void;
  onSelectCatalog: (hit: MedicineSearchHit) => void;
  onUseCustom: () => void;
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
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<MedicineSearchHit[]>([]);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState(value);

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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-sm shadow-md ring-1 ring-foreground/10"
        >
          <p className="sr-only" aria-live="polite">
            {statusLabel}
          </p>
          <ScrollArea className="max-h-56">
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
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
