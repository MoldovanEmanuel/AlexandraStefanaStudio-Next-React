"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#home",      label: "HOME",      section: "home",      route: null         },
  { href: "/#about",     label: "ABOUT",     section: "about",     route: null         },
  { href: "/#services",  label: "SERVICES",  section: "services",  route: null         },
  { href: "/portfolio",  label: "PORTFOLIO", section: "portfolio", route: "/portfolio" },
  { href: "/news",       label: "NEWS",      section: "news",      route: "/news"      },
  { href: "/contact",    label: "CONTACT",   section: null,        route: "/contact"   },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is in view on the homepage
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["home", "about", "services", "portfolio", "news"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [pathname]);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: "var(--nav-height)", background: "#221813", boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.3)" : "none", transition: "box-shadow 0.3s ease" }}
      >
        <div className="flex h-full items-center justify-between" style={{ padding: "0 40px" }}>
          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col leading-none transition-opacity hover:opacity-80"
          >
            <span className="font-display" style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "3px", lineHeight: 1, color: "var(--text-muted)" }}>
              ALEXANDRA STEFANA
            </span>
            <span className="font-body" style={{ fontSize: "7px", letterSpacing: "1px", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase" }}>
              Interior Designer &amp; Visualization | CG Artist
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center lg:flex" style={{ gap: "28px" }}>
            {navLinks.map(({ href, label, section, route }) => {
              const onHome = pathname === "/";
              const isActive =
                (onHome && section && activeSection === section) ||
                (!onHome && route && (pathname === route || pathname.startsWith(route + "/")));
              return (
                <Link key={href} href={href} className={cn("nav-link", isActive && "active")}>
                  {label}
                </Link>
              );
            })}
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
              {navLinks.map(({ href, label, section, route }) => {
                const onHome = pathname === "/";
                const isActive =
                  (onHome && section && activeSection === section) ||
                  (!onHome && route && (pathname === route || pathname.startsWith(route + "/")));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "font-display text-xl uppercase tracking-widest transition-colors",
                      isActive ? "text-accent" : "text-text-primary",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
