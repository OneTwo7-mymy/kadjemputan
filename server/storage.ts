import { users, guests, settings, programItems, type Guest, type InsertGuest, type Settings, type InsertSettings, type ProgramItem, type InsertProgramItem } from "@shared/schema";
import { db } from "./db";
import { eq, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: string): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;

  // Guest operations
  getGuests(): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  deleteGuest(id: number): Promise<void>;
  deleteGuests(ids: number[]): Promise<void>;
  drawWinner(): Promise<Guest | undefined>;
  resetDraw(): Promise<void>;

  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  // Program operations
  getProgramItems(): Promise<ProgramItem[]>;
  updateProgramItems(items: InsertProgramItem[]): Promise<ProgramItem[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: any): Promise<any> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests);
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const luckyDrawCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [guest] = await db.insert(guests).values({ ...insertGuest, luckyDrawCode }).returning();
    return guest;
  }

  async deleteGuest(id: number): Promise<void> {
    await db.delete(guests).where(eq(guests.id, id));
  }

  async deleteGuests(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await db.delete(guests).where(inArray(guests.id, ids));
  }

  async drawWinner(): Promise<Guest | undefined> {
    const eligible = await db.select().from(guests).where(eq(guests.isWinner, false));
    const confirmed = eligible.filter(g => g.attendance === 'attending');
    if (confirmed.length === 0) return undefined;

    const winner = confirmed[Math.floor(Math.random() * confirmed.length)];
    const [updated] = await db.update(guests)
      .set({ isWinner: true })
      .where(eq(guests.id, winner.id))
      .returning();
    return updated;
  }

  async resetDraw(): Promise<void> {
    await db.update(guests).set({ isWinner: false, winRank: null });
  }

  async getSettings(): Promise<Settings> {
    const [s] = await db.select().from(settings);
    if (!s) {
      const [newSettings] = await db.insert(settings).values({}).returning();
      return newSettings;
    }
    return s;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const s = await this.getSettings();
    const [updated] = await db.update(settings)
      .set(insertSettings)
      .where(eq(settings.id, s.id))
      .returning();
    return updated;
  }

  async getProgramItems(): Promise<ProgramItem[]> {
    return await db.select().from(programItems).orderBy(programItems.order);
  }

  async updateProgramItems(items: InsertProgramItem[]): Promise<ProgramItem[]> {
    await db.delete(programItems);
    if (items.length === 0) return [];
    return await db.insert(programItems).values(items).returning();
  }
}

export const storage = new DatabaseStorage();
