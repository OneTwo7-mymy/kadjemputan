import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { Guest, InsertGuest, Settings, InsertSettings, ProgramItem, InsertProgramItem } from "@shared/routes";

// Guests
export function useGuests() {
  return useQuery<Guest[]>({
    queryKey: [api.guests.list.path],
    queryFn: async () => {
      const res = await fetch(api.guests.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch guests");
      return res.json();
    },
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGuest) => {
      const res = await apiRequest(api.guests.create.method, api.guests.create.path, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

export function useDrawWinner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.guests.drawWinner.path, {
        method: api.guests.drawWinner.method,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("No eligible participants left");
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to draw winner");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

export function useResetDraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.guests.resetDraw.path, {
        method: api.guests.resetDraw.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset draw");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete guest");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

export function useBulkDeleteGuests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(api.guests.bulkDelete.path, {
        method: api.guests.bulkDelete.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete guests");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

// Settings
export function useSettings() {
  return useQuery<Settings>({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSettings) => {
      const res = await apiRequest(api.settings.update.method, api.settings.update.path, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.settings.get.path] }),
  });
}

// Program
export function useProgram() {
  return useQuery<ProgramItem[]>({
    queryKey: [api.program.list.path],
    queryFn: async () => {
      const res = await fetch(api.program.list.path);
      if (!res.ok) throw new Error("Failed to fetch program");
      return res.json();
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: InsertProgramItem[]) => {
      const res = await apiRequest(api.program.update.method, api.program.update.path, items);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.program.list.path] }),
  });
}

// Admin Users
interface AdminUser {
  id: number;
  username: string;
  displayName: string | null;
  createdAt: Date | null;
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: [api.admin.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch admin users");
      return res.json();
    },
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; password: string; displayName?: string }) => {
      const res = await apiRequest("POST", api.admin.create.path, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create admin user");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.list.path] }),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete admin user");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.list.path] }),
  });
}

export function useUpdateAdminPassword() {
  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const res = await fetch(`/api/admin/users/${id}/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update password");
      }
      return res.json();
    },
  });
}
