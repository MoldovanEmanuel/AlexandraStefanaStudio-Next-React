"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project, PaginatedResponse } from "@/types";

const QUERY_KEY = "projects";

async function fetchProjects(params?: {
  category?: string;
  page?: number;
  perPage?: number;
}): Promise<PaginatedResponse<Project>> {
  const url = new URL("/api/projects", window.location.origin);
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.perPage) url.searchParams.set("perPage", String(params.perPage));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function fetchProject(id: number): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  const json = await res.json();
  return json.data;
}

export function useProjects(params?: {
  category?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchProjects(params),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to reorder projects");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
