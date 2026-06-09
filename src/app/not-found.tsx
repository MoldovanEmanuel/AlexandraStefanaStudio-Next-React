import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-body text-xs uppercase tracking-[0.4em] text-accent mb-4">404</p>
        <h1 className="font-display text-display-md text-text-primary mb-6">
          Pagina nu a fost găsită
        </h1>
        <p className="font-body text-sm text-text-muted max-w-md mb-10">
          Pagina pe care o căutați nu există sau a fost mutată.
        </p>
        <Link href="/" className="btn-primary">
          Înapoi la pagina principală
        </Link>
      </main>
      <Footer />
    </>
  );
}
