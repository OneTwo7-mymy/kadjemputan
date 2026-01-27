import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, authStorage } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await seedDatabase();
  await setupAuth(app);
  await authStorage.ensureDefaultAdmin();
  registerObjectStorageRoutes(app);

  app.post(api.guests.create.path, async (req, res) => {
    try {
      const input = api.guests.create.input.parse(req.body);
      const guest = await storage.createGuest(input);
      res.status(201).json(guest);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.guests.list.path, isAuthenticated, async (req, res) => {
    const guests = await storage.getGuests();
    res.json(guests);
  });

  app.post(api.guests.drawWinner.path, isAuthenticated, async (req, res) => {
    const winner = await storage.drawWinner();
    if (!winner) {
      return res.status(404).json({ message: "No eligible participants found for the draw." });
    }
    res.json(winner);
  });

  app.post(api.guests.resetDraw.path, isAuthenticated, async (req, res) => {
    await storage.resetDraw();
    res.json({ message: "Draw has been reset." });
  });

  app.delete('/api/guests/:id', isAuthenticated, async (req, res) => {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    await storage.deleteGuest(id);
    res.json({ message: "Guest deleted successfully." });
  });

  app.post(api.guests.bulkDelete.path, isAuthenticated, async (req, res) => {
    try {
      const { ids } = api.guests.bulkDelete.input.parse(req.body);
      await storage.deleteGuests(ids);
      res.json({ message: "Guests deleted successfully.", count: ids.length });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.program.list.path, async (req, res) => {
    const items = await storage.getProgramItems();
    res.json(items);
  });

  app.post(api.program.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.program.update.input.parse(req.body);
      const items = await storage.updateProgramItems(input);
      res.json(items);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
