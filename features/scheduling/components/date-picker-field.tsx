"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  civilStringToDate,
  dateToCivilString,
  formatCivilDateLabel,
} from "@/features/scheduling/lib/civil-date";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Disable dates before today (local calendar). */
  disablePast?: boolean;
};

export function DatePickerField({
  value,
  onChange,
  id,
  disabled,
  placeholder = "Select date",
  className,
  disablePast = false,
}: DatePickerFieldProps) {
  const selected = value ? civilStringToDate(value) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start gap-2 rounded-xl border-[#E5E7EB] bg-white font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-brand-blue" aria-hidden />
        <span className="truncate">
          {value ? formatCivilDateLabel(value) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(dateToCivilString(date));
            }
          }}
          disabled={disablePast ? { before: today } : undefined}
          defaultMonth={selected}
        />
      </PopoverContent>
    </Popover>
  );
}
