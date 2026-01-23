import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Guest, type InsertGuest, type Settings, type InsertSettings } from "@shared/routes";

// Guests
export function useGuests() {
  return useQuery({
    queryKey: [api.guests.list.path],
    queryFn: async () => {
      const res = await fetch(api.guests.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch guests");
      return api.guests.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGuest) => {
      const res = await fetch(api.guests.create.path, {
        method: api.guests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to submit RSVP");
      }
      return api.guests.create.responses[201].parse(await res.json());
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
      return api.guests.drawWinner.responses[200].parse(await res.json());
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
      return api.guests.resetDraw.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

// Settings
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSettings) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.settings.get.path] }),
  });
}
