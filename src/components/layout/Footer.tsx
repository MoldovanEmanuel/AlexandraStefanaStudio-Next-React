import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-bg-lighter">
      <div className="mx-auto max-w-8xl px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="block mb-4">
              <span className="font-display text-xl tracking-widest text-text-primary">
                ALEXANDRA STEFANA
              </span>
              <br />
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-accent">
                Interior Design Studio
              </span>
            </Link>
            <p className="font-body text-sm text-text-muted leading-relaxed">
              Studio de design interior premium, Cluj-Napoca.
              <br />
              Transformăm spații în experiențe.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-body text-xs uppercase tracking-widest text-accent mb-4">
              Navigare
            </h3>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/portfolio", label: "Portofoliu" },
                { href: "/renders", label: "3D Animații" },
                { href: "/news", label: "Noutăți" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-body text-sm text-text-muted transition-colors hover:text-accent"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-body text-xs uppercase tracking-widest text-accent mb-4">
              Contact
            </h3>
            <address className="not-italic font-body text-sm text-text-muted space-y-2">
              <p>Cluj-Napoca, România</p>
              <a
                href="mailto:contact@alexandrastefana.studio"
                className="block transition-colors hover:text-accent"
              >
                contact@alexandrastefana.studio
              </a>
              <a
                href="https://www.instagram.com/alexandrastefana.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-accent"
              >
                @alexandrastefana.studio
              </a>
            </address>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="font-body text-xs text-text-faint">
            © {year} Alexandra Stefana Studio. Toate drepturile rezervate.
          </p>
          <p className="font-body text-xs text-text-faint">
            Design Interior · Cluj-Napoca
          </p>
        </div>
      </div>
    </footer>
  );
}
