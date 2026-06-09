"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/portfolio", label: "Portofoliu" },
  { href: "/renders", label: "3D Animații" },
  { href: "/news", label: "Noutăți" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-bg/95 backdrop-blur-sm border-b border-border shadow-card"
            : "bg-transparent",
        )}
        style={{ height: "var(--nav-height)" }}
      >
        <div className="mx-auto flex h-full max-w-8xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col leading-none transition-opacity hover:opacity-80"
          >
            <span className="font-display text-2xl tracking-widest text-text-primary">
              ALEXANDRA STEFANA
            </span>
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-accent">
              Interior Design Studio
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-link",
                  pathname === href && "active",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <span
              className={cn(
                "h-px w-6 bg-text-primary transition-all duration-300",
                mobileOpen && "translate-y-2.5 rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-6 bg-text-primary transition-all duration-300",
                mobileOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-px w-6 bg-text-primary transition-all duration-300",
                mobileOpen && "-translate-y-2.5 -rotate-45",
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[var(--nav-height)] z-40 bg-bg-lighter border-b border-border px-6 pb-8 pt-6 lg:hidden"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "font-display text-xl uppercase tracking-widest transition-colors",
                    pathname === href ? "text-accent" : "text-text-primary",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
