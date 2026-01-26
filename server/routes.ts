import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await seedDatabase();
  await setupAuth(app);
  registerAuthRoutes(app);
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

  return httpServer;
}
