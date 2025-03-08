import { users, type User, type InsertUser, type Progress, type GameModule, type InsertGameModule, type Achievement, type InsertAchievement, type UserAchievement } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  updateUserProgress(userId: number, xp: number): Promise<User>;

  // Progress methods
  getProgress(userId: number): Promise<Progress[]>;
  saveProgress(progress: Progress): Promise<Progress>;

  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  awardAchievement(userId: number, achievementId: number): Promise<void>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  getAllProgress(): Promise<Progress[]>;

  // Game module methods
  createGameModule(module: InsertGameModule & { createdBy: number }): Promise<GameModule>;
  updateGameModule(id: number, module: Partial<GameModule>): Promise<GameModule>;
  deleteGameModule(id: number): Promise<void>;
  getGameModule(id: number): Promise<GameModule | undefined>;
  getGameModules(type?: string): Promise<GameModule[]>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progress: Map<number, Progress[]>;
  private gameModules: Map<number, GameModule>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement[]>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.gameModules = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
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

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    console.log('Creating user:', insertUser);
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      points: 0,
      level: 1,
      xp: 0,
      isAdmin: insertUser.isAdmin ?? false,
      isModerator: false
    };
    this.users.set(id, user);
    console.log('User created:', user);
    return user;
  }

  async updateUserProgress(userId: number, xp: number): Promise<User> {
    console.log('Updating user progress for:', userId);
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newXp = user.xp + xp;
    const newLevel = Math.floor(newXp / 100) + 1;
    
    // Update the user with new XP and level
    const updatedUser: User = {
      ...user,
      xp: newXp,
      level: newLevel
    };
    
    this.users.set(userId, updatedUser);
    
    // Check for achievements based on new level
    const achievements = await this.getAchievements();
    for (const achievement of achievements) {
      if (achievement.type === 'level' && newLevel >= achievement.requirement) {
        await this.awardAchievement(userId, achievement.id);
      }
    }
    
    console.log('Updated user:', updatedUser);
    return updatedUser;
  }

  async getProgress(userId: number): Promise<Progress[]> {
    return this.progress.get(userId) || [];
  }
  
  async saveProgress(progress: Progress): Promise<Progress> {
    const userProgress = this.progress.get(progress.userId) || [];
    userProgress.push(progress);
    this.progress.set(progress.userId, userProgress);

    // Update user XP and check achievements
    const user = await this.updateUserProgress(progress.userId, progress.xpEarned);

    // Check for achievement unlocks
    const achievements = await this.getAchievements();
    for (const achievement of achievements) {
      switch (achievement.type) {
        case 'level':
          if (user.level >= achievement.requirement) {
            await this.awardAchievement(user.id, achievement.id);
          }
          break;
        case 'score':
          if (progress.score >= achievement.requirement) {
            await this.awardAchievement(user.id, achievement.id);
          }
          break;
        case 'completion':
          const userProgress = await this.getProgress(user.id);
          const completedGames = userProgress.filter(p => p.completed).length;
          if (completedGames >= achievement.requirement) {
            await this.awardAchievement(user.id, achievement.id);
          }
          break;
      }
    }

    return progress;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId++;
    const newAchievement: Achievement = {
      ...achievement,
      id,
      createdAt: new Date(),
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    const userAchs = this.userAchievements.get(userId) || [];
    return Promise.all(
      userAchs.map(ua => this.achievements.get(ua.achievementId)!)
    );
  }

  async awardAchievement(userId: number, achievementId: number): Promise<void> {
    const userAchs = this.userAchievements.get(userId) || [];
    if (userAchs.some(ua => ua.achievementId === achievementId)) {
      return; // Already awarded
    }

    const newAward: UserAchievement = {
      id: this.currentId++,
      userId,
      achievementId,
      earnedAt: new Date(),
    };

    userAchs.push(newAward);
    this.userAchievements.set(userId, userAchs);
    
    // Update user points when they earn an achievement
    const user = await this.getUser(userId);
    if (user) {
      user.points += 10; // Award 10 points per achievement
      this.users.set(userId, user);
    }
  }
  
  async hasAchievement(userId: number, achievementId: number): Promise<boolean> {
    const userAchs = this.userAchievements.get(userId) || [];
    return userAchs.some(ua => ua.achievementId === achievementId);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllProgress(): Promise<Progress[]> {
    const allProgress: Progress[] = [];
    for (const userProgress of this.progress.values()) {
      allProgress.push(...userProgress);
    }
    return allProgress;
  }

  async createGameModule(module: InsertGameModule & { createdBy: number }): Promise<GameModule> {
    const id = this.currentId++;
    const now = new Date().toISOString();
    const gameModule: GameModule = {
      ...module,
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.gameModules.set(id, gameModule);
    return gameModule;
  }

  async updateGameModule(id: number, updates: Partial<GameModule>): Promise<GameModule> {
    const existing = await this.getGameModule(id);
    if (!existing) {
      throw new Error(`Game module ${id} not found`);
    }

    const updated: GameModule = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.gameModules.set(id, updated);
    return updated;
  }

  async deleteGameModule(id: number): Promise<void> {
    this.gameModules.delete(id);
  }

  async getGameModule(id: number): Promise<GameModule | undefined> {
    return this.gameModules.get(id);
  }

  async getGameModules(type?: string): Promise<GameModule[]> {
    const modules = Array.from(this.gameModules.values());
    return type ? modules.filter(m => m.type === type) : modules;
  }
}

export const storage = new MemStorage();