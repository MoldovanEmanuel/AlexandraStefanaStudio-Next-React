"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AdminUser } from "@/types";

interface AdminState {
  user: AdminUser | null;
  sidebarOpen: boolean;
  setUser: (user: AdminUser | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        sidebarOpen: true,

        setUser: (user) => set({ user }),

        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        logout: () => {
          set({ user: null });
          // Clear cookie via API
          fetch("/api/auth/logout", { method: "POST" });
        },
      }),
      {
        name: "admin-store",
        partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
      },
    ),
    { name: "AdminStore" },
  ),
);
