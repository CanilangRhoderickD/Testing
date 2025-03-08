import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProgressSchema, insertGameModuleSchema, insertAchievementSchema } from "@shared/schema";

function isAdmin(req: any) {
  return req.isAuthenticated() && req.user?.isAdmin;
}

function isModerator(req: any) {
  return req.isAuthenticated() && (req.user?.isAdmin || req.user?.isModerator);
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Progress and achievement routes
  app.get("/api/progress/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    const progress = await storage.getProgress(userId);
    res.json(progress);
  });

  app.post("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertProgressSchema.parse(req.body);
    
    // Save the progress
    const progress = await storage.saveProgress({
      ...data,
      userId: req.user.id,
      completedAt: new Date(),
    });
    
    // Update user XP and level
    const updatedUser = await storage.updateUserProgress(req.user.id, data.xpEarned || 0);
    
    // Check for score-based achievements
    const achievements = await storage.getAchievements();
    for (const achievement of achievements) {
      if (achievement.type === 'score' && data.score >= achievement.requirement) {
        await storage.awardAchievement(req.user.id, achievement.id);
      }
      
      if (achievement.type === 'completion' && data.completed) {
        // Get all completed games for this user
        const userProgress = await storage.getProgress(req.user.id);
        const completedCount = userProgress.filter(p => p.completed).length;
        
        if (completedCount >= achievement.requirement) {
          await storage.awardAchievement(req.user.id, achievement.id);
        }
      }
    }
    
    // Return progress with updated user info
    res.json({
      ...progress,
      user: {
        level: updatedUser.level,
        xp: updatedUser.xp
      }
    });
  });

  app.get("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const achievements = await storage.getAchievements();
    res.json(achievements);
  });

  app.get("/api/achievements/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    const achievements = await storage.getUserAchievements(userId);
    res.json(achievements);
  });

  // Game module routes
  app.get("/api/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const type = req.query.type as string | undefined;
    const modules = await storage.getGameModules(type);
    res.json(modules);
  });

  app.get("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const module = await storage.getGameModule(parseInt(req.params.id));
    if (!module) return res.sendStatus(404);
    res.json(module);
  });

  // Admin routes
  app.post("/api/admin/achievements", async (req, res) => {
    if (!isAdmin(req)) return res.sendStatus(401);
    const data = insertAchievementSchema.parse(req.body);
    const achievement = await storage.createAchievement(data);
    res.status(201).json(achievement);
  });

  app.post("/api/admin/modules", async (req, res) => {
    if (!isAdmin(req)) return res.sendStatus(401);
    const data = insertGameModuleSchema.parse(req.body);
    const module = await storage.createGameModule({
      ...data,
      createdBy: req.user.id,
    });
    res.status(201).json(module);
  });

  app.patch("/api/admin/modules/:id", async (req, res) => {
    if (!isAdmin(req)) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const module = await storage.updateGameModule(id, req.body);
    res.json(module);
  });

  app.delete("/api/admin/modules/:id", async (req, res) => {
    if (!isAdmin(req)) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteGameModule(id);
    res.sendStatus(204);
  });

  app.get("/api/admin/progress", async (req, res) => {
    if (!isModerator(req)) return res.sendStatus(401);
    const allProgress = await storage.getAllProgress();
    res.json(allProgress);
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!isModerator(req)) return res.sendStatus(401);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  const httpServer = createServer(app);
  return httpServer;
}