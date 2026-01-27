import { adminUsers, type AdminUser, type InsertAdminUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IAuthStorage {
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminById(id: number): Promise<AdminUser | undefined>;
  getAllAdmins(): Promise<AdminUser[]>;
  createAdmin(data: InsertAdminUser): Promise<AdminUser>;
  deleteAdmin(id: number): Promise<void>;
  updateAdminPassword(id: number, password: string): Promise<void>;
  ensureDefaultAdmin(): Promise<void>;
}

class AuthStorage implements IAuthStorage {
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return admin;
  }

  async getAdminById(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    return admin;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  async createAdmin(data: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [admin] = await db
      .insert(adminUsers)
      .values({ ...data, password: hashedPassword })
      .returning();
    return admin;
  }

  async deleteAdmin(id: number): Promise<void> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }

  async updateAdminPassword(id: number, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(adminUsers).set({ password: hashedPassword }).where(eq(adminUsers.id, id));
  }

  async ensureDefaultAdmin(): Promise<void> {
    const existingAdmin = await this.getAdminByUsername("admin");
    if (!existingAdmin) {
      await this.createAdmin({
        username: "admin",
        password: "admin123",
        displayName: "Administrator",
      });
      console.log("Default admin user created (username: admin, password: admin123)");
    }
  }
}

export const authStorage = new AuthStorage();
