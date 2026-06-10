"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/projects", label: "PROJECTS" },
  { href: "/admin/projects/new", label: "ADD PROJECT" },
  { href: "/admin/news", label: "NEWS" },
  { href: "/admin/hero", label: "HERO SLIDES" },
  { href: "/admin/renders", label: "3D RENDERS" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminStore();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-lighter border-r border-border flex flex-col z-40 hidden lg:flex">
      {/* Brand */}
      <div className="p-6 border-b border-border">
        <p className="font-display tracking-widest text-text-primary" style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "3px" }}>
          ALEXANDRA STEFANA
        </p>
        <p className="font-body text-xs uppercase tracking-widest text-accent mt-1">Studio Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block px-4 py-2.5 font-body text-xs tracking-widest transition-colors",
              pathname === href || (href !== "/admin/projects/new" && pathname.startsWith(href) && href !== "/admin/projects")
                ? "text-accent bg-accent/10"
                : pathname.startsWith("/admin/projects") && href === "/admin/projects"
                  ? "text-accent bg-accent/10"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-card",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* View site + Logout */}
      <div className="p-4 border-t border-border space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="block px-4 py-2.5 font-body text-xs uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
        >
          VIEW SITE
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 font-body text-xs uppercase tracking-widest text-text-muted hover:text-red-500 transition-colors"
        >
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
