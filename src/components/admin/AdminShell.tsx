"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8 ml-0 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
