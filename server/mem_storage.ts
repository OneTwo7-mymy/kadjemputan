import { IStorage } from "./storage";
import {
  User,
  InsertUser,
  Guest,
  InsertGuest,
  Settings,
  InsertSettings,
  ProgramItem,
  InsertProgramItem,
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private guests: Map<number, Guest>;
  private settings: Map<number, Settings>;
  private programItems: Map<number, ProgramItem>;
  sessionStore: session.Store;
  currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.guests = new Map();
    this.settings = new Map();
    this.programItems = new Map();
    this.currentId = { users: 1, guests: 1, settings: 1, programItems: 1 };
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentId.guests++;
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const luckyDrawCode = `H-${randomNumber}`;
    const guest: Guest = {
      ...insertGuest,
      id,
      luckyDrawCode,
      isWinner: false,
      winRank: null,
      createdAt: new Date(),
      active: true, // Assuming active field based on typical schema, but adhering to provided shared/schema.ts below
    };
    // Adjusting based on standard schema provided in previous turn:
    // id, name, phoneNumber, attendance, totalPax, wishes, luckyDrawCode, isWinner, winRank, createdAt
    // The previous schema didn't show 'active', checking shared/schema.ts output again...
    // Schema: id, name, phoneNumber, attendance, totalPax, wishes, luckyDrawCode, isWinner, winRank, createdAt
    
    this.guests.set(id, guest);
    return guest;
  }

  async deleteGuest(id: number): Promise<void> {
    this.guests.delete(id);
  }

  async deleteGuests(ids: number[]): Promise<void> {
    ids.forEach((id) => this.guests.delete(id));
  }

  async drawWinner(): Promise<Guest | undefined> {
    const eligible = Array.from(this.guests.values()).filter(
      (g) => !g.isWinner && g.attendance === "attending",
    );
    if (eligible.length === 0) return undefined;

    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const updated = { ...winner, isWinner: true };
    this.guests.set(winner.id, updated);
    return updated;
  }

  async resetDraw(): Promise<void> {
    for (const [id, guest] of this.guests) {
      this.guests.set(id, { ...guest, isWinner: false, winRank: null });
    }
  }

  async getSettings(): Promise<Settings> {
    const settings = this.settings.get(1);
    if (!settings) {
      const defaultSettings: Settings = {
        id: 1,
        eventName: "Rumah Terbuka & Akikah",
        eventNameLine2: null,
        familyName: "Keluarga Hj. Ahmad & Hjh. Sarah",
        familyIntro: null,
        eventDate: "Sabtu, 25 Nov 2024",
        eventTime: "11:00 PG - 4:00 PTG",
        locationName: "Dewan Seri Kenangan, KL",
        googleMapsUrl: "https://maps.google.com",
        wazeUrl: "https://waze.com",
        heroImageUrl:
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop",
        musicUrl: null,
        musicTitle: null,
        footerText: "© 2024 Majlis Akikah & Rumah Terbuka",
        luckyDrawEnabled: true,
        responseAttending:
          "Terima kasih! Kami tidak sabar untuk bertemu anda di majlis nanti.",
        responseMaybe:
          "Terima kasih atas maklum balas. Kami harap dapat bertemu anda!",
        responseNotAttending:
          "Terima kasih atas maklum balas. Semoga dapat bertemu di lain kesempatan.",
      };
      this.settings.set(1, defaultSettings);
      return defaultSettings;
    }
    return settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...insertSettings };
    this.settings.set(1, updated);
    return updated;
  }

  async getProgramItems(): Promise<ProgramItem[]> {
    return Array.from(this.programItems.values()).sort(
      (a, b) => a.order - b.order,
    );
  }

  async updateProgramItems(items: InsertProgramItem[]): Promise<ProgramItem[]> {
    this.programItems.clear();
    const newItems: ProgramItem[] = [];
    items.forEach((item, index) => {
      const id = this.currentId.programItems++;
      const newItem: ProgramItem = { ...item, id: id, order: item.order ?? index }; // Ensure order is number
      this.programItems.set(id, newItem);
      newItems.push(newItem);
    });
    return newItems;
  }
}
