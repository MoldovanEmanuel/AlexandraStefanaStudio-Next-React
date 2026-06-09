"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/admin/projects", label: "Proiecte", icon: "◫" },
  { href: "/admin/news", label: "Noutăți", icon: "◉" },
  { href: "/admin/hero", label: "Hero Slides", icon: "▣" },
  { href: "/admin/renders", label: "Animații 3D", icon: "▶" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminStore();

  const handleLogout = async () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-lighter border-r border-border flex flex-col z-40 hidden lg:flex">
      {/* Brand */}
      <div className="p-6 border-b border-border">
        <p className="font-display text-lg tracking-widest text-text-primary">AS STUDIO</p>
        <p className="font-body text-xs uppercase tracking-widest text-accent mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 font-body text-sm transition-colors",
              pathname.startsWith(href)
                ? "text-accent bg-accent/10"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-card",
            )}
          >
            <span className="text-base opacity-70">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* View site + Logout */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 font-body text-xs uppercase tracking-widest text-text-faint hover:text-text-secondary transition-colors"
        >
          <span>↗</span> Vezi site-ul
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-xs uppercase tracking-widest text-text-faint hover:text-red-700 transition-colors"
        >
          <span>→</span> Deconectare
        </button>
      </div>
    </aside>
  );
}
