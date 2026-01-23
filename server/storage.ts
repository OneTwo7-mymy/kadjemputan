import { db } from "./db";
import { guests, settings, type Guest, type InsertGuest, type Settings, type InsertSettings } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authStorage as BaseAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  getUser(id: string): Promise<any>;
  upsertUser(user: any): Promise<any>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  getGuests(): Promise<Guest[]>;
  drawWinner(): Promise<Guest | undefined>;
  resetDraw(): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(data: InsertSettings): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) { return BaseAuthStorage.getUser(id); }
  async upsertUser(user: any) { return BaseAuthStorage.upsertUser(user); }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [guest] = await db
      .insert(guests)
      .values({ ...insertGuest, luckyDrawCode: code })
      .returning();
    return guest;
  }

  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests).orderBy(guests.createdAt);
  }

  async drawWinner(): Promise<Guest | undefined> {
    const eligibleGuests = await db
      .select()
      .from(guests)
      .where(and(eq(guests.attendance, "attending"), eq(guests.isWinner, false)));

    if (eligibleGuests.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * eligibleGuests.length);
    const winner = eligibleGuests[randomIndex];

    const [updatedWinner] = await db
      .update(guests)
      .set({ isWinner: true, winRank: 1 })
      .where(eq(guests.id, winner.id))
      .returning();

    return updatedWinner;
  }

  async resetDraw(): Promise<void> {
    await db.update(guests).set({ isWinner: false, winRank: null });
  }

  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    if (existing) return existing;
    const [created] = await db.insert(settings).values({}).returning();
    return created;
  }

  async updateSettings(data: InsertSettings): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(data)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
