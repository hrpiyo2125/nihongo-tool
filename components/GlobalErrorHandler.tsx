"use client";

import { useEffect } from "react";
import { useAuth } from "../app/[locale]/AuthContext";
import { logError } from "../lib/logError";

export default function GlobalErrorHandler() {
  const { userId } = useAuth();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError({
        type: "uncaught",
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userId: userId || undefined,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      logError({
        type: "unhandled_rejection",
        message,
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        url: window.location.href,
        userId: userId || undefined,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [userId]);

  return null;
}
