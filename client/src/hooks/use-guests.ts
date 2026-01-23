import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Guest, type InsertGuest } from "@shared/routes";

// GET /api/guests
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

// POST /api/guests (RSVP)
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
    // We don't necessarily need to invalidate the list if this is a public form submission,
    // but it helps if we are viewing the admin panel simultaneously.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.guests.list.path] }),
  });
}

// POST /api/guests/draw (Draw Winner)
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

// POST /api/guests/reset-draw
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
