"use client";

import { useCallback, useRef } from "react";

interface ErrorHandlerOptions {
  onError?: (error: Error, context?: string) => void;
  logToConsole?: boolean;
  showToast?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { onError, logToConsole = true, showToast = true } = options;

  const errorCountRef = useRef(0);
  const lastErrorRef = useRef<Error | null>(null);

  const handleError = useCallback(
    (error: Error, context?: string) => {
      // Prevent error spam
      const now = Date.now();
      const isSameError = lastErrorRef.current?.message === error.message;
      const isRecentError = now - (errorCountRef.current as any) < 1000;

      if (isSameError && isRecentError) {
        return;
      }

      lastErrorRef.current = error;
      errorCountRef.current = now;

      // Log to console in development
      if (logToConsole && process.env.NODE_ENV === "development") {
        console.error(`[ErrorHandler] ${context ? `[${context}]` : ""}`, error);
      }

      // Call custom error handler
      onError?.(error, context);

      // Show toast notification
      if (showToast) {
        // You can integrate with a toast library here
        console.error("Error:", error.message);
      }

      // Log to external service in production
      if (process.env.NODE_ENV === "production") {
        // You can integrate with error reporting services like Sentry here
        console.error("Production error:", error, context);
      }
    },
    [onError, logToConsole, showToast]
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: string,
      fallback?: T
    ): Promise<T | undefined> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error as Error, context);
        return fallback;
      }
    },
    [handleError]
  );

  const withErrorHandling = useCallback(
    <T extends (...args: any[]) => any>(fn: T, context?: string): T => {
      return ((...args: Parameters<T>) => {
        try {
          const result = fn(...args);

          // Handle promise results
          if (result && typeof result.catch === "function") {
            return result.catch((error: Error) => {
              handleError(error, context);
              throw error;
            });
          }

          return result;
        } catch (error) {
          handleError(error as Error, context);
          throw error;
        }
      }) as T;
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    withErrorHandling,
  };
};
