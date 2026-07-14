import type { LogLevel, LoggerContext } from "@/types/common";

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  context?: LoggerContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
};

function serializeError(error: unknown): LogPayload["error"] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack:
        process.env.NODE_ENV === "production" ? undefined : error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function write(payload: LogPayload): void {
  const line = JSON.stringify(payload);

  switch (payload.level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(line);
      }
      break;
    default:
      console.info(line);
  }
}

/**
 * Structured JSON logger (stdout). Swap transport later (Axiom/Datadog) without
 * changing call sites.
 */
export const logger = {
  debug(message: string, context?: LoggerContext, requestId?: string) {
    write({
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context,
    });
  },

  info(message: string, context?: LoggerContext, requestId?: string) {
    write({
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context,
    });
  },

  warn(message: string, context?: LoggerContext, requestId?: string) {
    write({
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context,
    });
  },

  error(
    message: string,
    error?: unknown,
    context?: LoggerContext,
    requestId?: string,
  ) {
    write({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context,
      error: error === undefined ? undefined : serializeError(error),
    });
  },
};
