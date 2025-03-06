import session from "express-session";
import createMemoryStore from "memorystore";
import { User, GameModule, InsertUser, InsertGameModule } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  private users: Map<number, User>;
  private gameModules: Map<number, GameModule>;
  sessionStore: session.Store;
  currentId: number;
  currentModuleId: number;

  constructor() {
    this.users = new Map();
    this.gameModules = new Map();
    this.currentId = 1;
    this.currentModuleId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Use a simple known password for the admin that doesn't require hashing
    // This makes it easier for development purposes
    const adminUser = {
      username: "admin",
      password: "admin123",
      isAdmin: true,
    };
    this.createUser(adminUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin || false,
      score: 0,
      progress: {
        completedModules: [],
        badges: [],
        currentLevel: 1,
        dailyChallenges: [],
        lastLoginDate: now
      }
    };
    this.users.set(id, user);
    return user;
  }

  async getGameModules(): Promise<GameModule[]> {
    return Array.from(this.gameModules.values());
  }

  async createGameModule(module: InsertGameModule): Promise<GameModule> {
    const id = this.currentModuleId++;
    const gameModule = {
      ...module,
      id,
      ageGroup: module.ageGroup || "all",
      difficulty: module.difficulty || "beginner"
    } as GameModule;
    this.gameModules.set(id, gameModule);
    return gameModule;
  }

  async updateGameModule(id: number, data: InsertGameModule): Promise<GameModule | null> {
    const existingModule = this.gameModules.get(id);
    if (!existingModule) return null;

    const updatedModule = { ...existingModule, ...data };
    this.gameModules.set(id, updatedModule);
    return updatedModule;
  }

  async deleteGameModule(id: number): Promise<GameModule | undefined> {
    const deletedModule = this.gameModules.get(id);
    this.gameModules.delete(id);
    return deletedModule;
  }


  async updateUserProgress(
    userId: number,
    moduleId: number,
    score: number
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      score: user.score + score,
      progress: {
        ...user.progress,
        completedModules: [...user.progress.completedModules, moduleId.toString()]
      }
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();