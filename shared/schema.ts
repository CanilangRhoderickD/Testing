import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age").notNull(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isModerator: boolean("is_moderator").default(false).notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'level', 'score', 'completion'
  requirement: integer("requirement").notNull(), // XP/score/count needed
  badgeUrl: text("badge_url").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").notNull(),
});

export const gameModules = pgTable("game_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'crossword', 'four_pics', 'word_scramble'
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull(), // 1-5
  xpReward: integer("xp_reward").notNull(),
  content: json("content").notNull(), // Store game-specific content
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").notNull(), // Admin/Moderator who created
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameType: text("game_type").notNull(),
  completed: boolean("completed").default(false).notNull(),
  score: integer("score").default(0).notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  completedAt: timestamp("completed_at"),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  age: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  type: true,
  requirement: true,
  badgeUrl: true,
});

export const insertGameModuleSchema = createInsertSchema(gameModules)
  .pick({
    name: true,
    type: true,
    description: true,
    difficulty: true,
    xpReward: true,
    content: true,
  })
  .extend({
    name: z.string().min(3, "Name must be at least 3 characters"),
    type: z.enum(["crossword", "four_pics", "word_scramble"], {
      required_error: "Please select a game type",
    }),
    description: z.string().min(10, "Description must be at least 10 characters"),
    difficulty: z.number().min(1).max(5),
    xpReward: z.number().min(10),
    content: z.object({}).passthrough(),
  });

export const insertProgressSchema = createInsertSchema(progress);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type GameModule = typeof gameModules.$inferSelect;
export type InsertGameModule = z.infer<typeof insertGameModuleSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;