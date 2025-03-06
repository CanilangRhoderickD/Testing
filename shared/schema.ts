
import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define content structure types for different game types
export interface GameContent {
  type: string;
  data?: any;
  instances?: any[];
}

export interface GameModule {
  id: number;
  title: string;
  description: string;
  ageGroup: string;
  difficulty: string;
  content: GameContent;
  createdAt?: string;
  updatedAt?: string;
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  score: integer("score").default(0).notNull(),
  progress: json("progress").$type<{
    completedModules: string[];
    badges: Array<{
      id: string;
      name: string;
      description: string;
      dateEarned: string;
    }>;
    currentLevel: number;
    dailyChallenges: Array<{
      date: string;
      completed: boolean;
      moduleId: string;
    }>;
    lastLoginDate: string;
  }>().default({
    completedModules: [],
    badges: [],
    currentLevel: 1,
    dailyChallenges: [],
    lastLoginDate: new Date().toISOString()
  }).notNull()
});

export const gameModules = pgTable("game_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ageGroup: text("age_group").notNull(),
  difficulty: text("difficulty").notNull(),
  content: json("content").$type<{
    type: "quiz" | "simulation" | "tutorial" | "crossword" | "pictureWord" | "wordScramble";
    data: Record<string, any>;
  }>().notNull()
});

// Achievement definitions
export const achievements = {
  BEGINNER: {
    id: "beginner",
    name: "Fire Safety Rookie",
    description: "Complete your first module",
    requirement: (progress: any) => progress.completedModules.length >= 1
  },
  INTERMEDIATE: {
    id: "intermediate",
    name: "Safety Scout",
    description: "Complete 5 different modules",
    requirement: (progress: any) => progress.completedModules.length >= 5
  },
  ADVANCED: {
    id: "advanced",
    name: "Fire Prevention Expert",
    description: "Complete all modules in a difficulty level",
    requirement: (progress: any) => progress.completedModules.length >= 10
  },
  DAILY_STREAK: {
    id: "daily_streak",
    name: "Daily Guardian",
    description: "Complete 5 daily challenges",
    requirement: (progress: any) => progress.dailyChallenges.filter((c: any) => c.completed).length >= 5
  }
};

// Level requirements
export const levelRequirements = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
];

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const insertGameModuleSchema = createInsertSchema(gameModules);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameModule = typeof gameModules.$inferSelect;
export type InsertGameModule = z.infer<typeof insertGameModuleSchema>;

// Game type specific schemas
export const CrosswordData = z.object({
  grid: z.array(z.array(z.string())),
  clues: z.object({
    across: z.array(z.object({
      number: z.number(),
      clue: z.string(),
      answer: z.string()
    })),
    down: z.array(z.object({
      number: z.number(),
      clue: z.string(),
      answer: z.string()
    }))
  })
});

export const PictureWordData = z.object({
  images: z.array(z.string()),
  correctWord: z.string(),
  hints: z.array(z.string())
});

export const WordScrambleData = z.object({
  word: z.string(),
  hint: z.string(),
  category: z.string()
});
