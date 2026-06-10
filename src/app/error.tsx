"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-body text-xs uppercase tracking-[0.4em] text-accent mb-4">Error</p>
      <h1 className="font-display text-display-md text-text-primary mb-6">
        Something went wrong
      </h1>
      <p className="font-body text-sm text-text-muted max-w-md mb-10">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </main>
  );
}
