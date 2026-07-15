import { AlertCircleIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type ErrorMessageProps = {
  title?: string;
  message: string;
  className?: string;
};

/**
 * Presentational ActionResult / mutation error banner.
 * Use for form-level and page-level failures (not field errors — use FormField).
 */
export function ErrorMessage({
  title = "Something went wrong",
  message,
  className,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
