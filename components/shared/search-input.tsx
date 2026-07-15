"use client";

import { SearchIcon, XIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
};

/**
 * Mobile-friendly search field with clear control.
 * Presentational only — filtering stays in the feature.
 */
export function SearchInput({
  value,
  onValueChange,
  onClear,
  className,
  placeholder = "Search…",
  id,
  ...props
}: SearchInputProps) {
  const inputId = id ?? "search";

  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={inputId}
        type="search"
        value={value}
        placeholder={placeholder}
        className="pr-9 pl-8"
        aria-label={props["aria-label"] ?? placeholder}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        {...props}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          aria-label="Clear search"
          onClick={() => {
            onValueChange("");
            onClear?.();
          }}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
