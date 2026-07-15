import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  /** Associated control id for label `htmlFor` / accessibility. */
  id?: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
};

/**
 * Opinionated Field wrapper for Clinic forms (RHF / Server Action forms).
 * Composes shadcn Field primitives so features do not re-assemble label/error markup.
 */
export function FormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
  className,
  orientation = "vertical",
}: FormFieldProps) {
  const descriptionId = id && description ? `${id}-description` : undefined;
  const errorId = id && error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const control =
    isValidElement(children) && id
      ? cloneElement(
          children as ReactElement<Record<string, unknown>>,
          {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-required": required || undefined,
            "aria-describedby": describedBy,
          }
        )
      : children;

  return (
    <Field
      orientation={orientation}
      data-invalid={error ? true : undefined}
      className={cn(className)}
    >
      <FieldLabel htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">(required)</span> : null}
      </FieldLabel>
      <FieldContent>
        {control}
        {description ? (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        ) : null}
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}
