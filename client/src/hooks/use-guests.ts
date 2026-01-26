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
