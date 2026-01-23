import { db } from "./db";
import { guests, type Guest, type InsertGuest } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  createGuest(guest: InsertGuest): Promise<Guest>;
  getGuests(): Promise<Guest[]>;
  drawWinner(): Promise<Guest | undefined>;
  resetDraw(): Promise<void>;
}

export class DatabaseStorage extends authStorage.constructor implements IStorage {
  constructor() {
    super();
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    // Generate a simple 4-digit code (e.g. A-1023) or random string
    // For simplicity, let's use a random 6-char alphanumeric string
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
    // Select a random guest who is attending and not yet a winner
    const eligibleGuests = await db
      .select()
      .from(guests)
      .where(and(eq(guests.attendance, "attending"), eq(guests.isWinner, false)));

    if (eligibleGuests.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * eligibleGuests.length);
    const winner = eligibleGuests[randomIndex];

    // Mark as winner
    const [updatedWinner] = await db
      .update(guests)
      .set({ isWinner: true, winRank: 1 }) // Simple rank logic for now
      .where(eq(guests.id, winner.id))
      .returning();

    return updatedWinner;
  }

  async resetDraw(): Promise<void> {
    await db.update(guests).set({ isWinner: false, winRank: null });
  }
}

export const storage = new DatabaseStorage();
