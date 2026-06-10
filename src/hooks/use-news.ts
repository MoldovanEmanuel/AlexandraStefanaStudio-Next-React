"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NewsItem, PaginatedResponse } from "@/types";

const QUERY_KEY = "news";

async function fetchNews(params?: {
  page?: number;
  perPage?: number;
  admin?: boolean;
}): Promise<PaginatedResponse<NewsItem>> {
  const url = new URL("/api/news", window.location.origin);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.perPage) url.searchParams.set("perPage", String(params.perPage));
  if (params?.admin) url.searchParams.set("admin", "1");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export function useNews(params?: { page?: number; perPage?: number; admin?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchNews(params),
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete news item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useReorderNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/news/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to reorder news");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
