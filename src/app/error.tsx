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
      <p className="font-body text-xs uppercase tracking-[0.4em] text-accent mb-4">Eroare</p>
      <h1 className="font-display text-display-md text-text-primary mb-6">
        Ceva nu a funcționat
      </h1>
      <p className="font-body text-sm text-text-muted max-w-md mb-10">
        A apărut o eroare neașteptată. Vă rugăm să încercați din nou.
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="btn-primary">
          Încearcă din nou
        </button>
        <Link href="/" className="btn-secondary">
          Pagina principală
        </Link>
      </div>
    </main>
  );
}
