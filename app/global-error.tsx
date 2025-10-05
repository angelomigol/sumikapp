"use client";

import { ServerOff } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="bg-background flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="text-destructive mx-auto flex size-12 items-center justify-center">
              <ServerOff className="size-12" />
            </div>
            <h1 className="text-foreground mt-4 text-6xl font-bold tracking-tight sm:text-7xl">
              500
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Something went very wrong!
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {error
                ? error.message
                : "A critical error occurred in the application. Please refresh the page or contact support."}
            </p>
            <div className="mt-6 space-x-4">
              <button
                onClick={reset}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
