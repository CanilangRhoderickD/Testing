import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertGameModuleSchema } from "@shared/schema";
import { z } from "zod";
import passport from 'passport'; // Assuming passport is used for authentication

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game module endpoints
  app.get("/api/modules", async (req, res) => {
    const modules = await storage.getGameModules();
    res.json(modules);
  });

  app.post("/api/modules", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).send("Admin access required");
    }

    const parsed = insertGameModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const module = await storage.createGameModule(parsed.data);
    res.status(201).json(module);
  });

  app.put("/api/modules/:id", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).send("Admin access required");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid module ID");
    }

    const parsed = insertGameModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const updatedModule = await storage.updateGameModule(id, parsed.data);
    if (!updatedModule) {
      return res.status(404).send("Module not found");
    }
    
    res.json(updatedModule);
  });

  app.delete("/api/modules/:id", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).send("Admin access required");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid module ID");
    }

    const deleted = await storage.deleteGameModule(id);
    if (!deleted) {
      return res.status(404).send("Module not found");
    }
    
    res.status(204).end();
  });

  // User progress endpoints
  app.post("/api/progress", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const schema = z.object({
      moduleId: z.number(),
      score: z.number(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const updatedUser = await storage.updateUserProgress(
      req.user.id,
      parsed.data.moduleId,
      parsed.data.score
    );

    res.json(updatedUser);
  });

  // Login route is already handled in auth.ts


  const httpServer = createServer(app);
  return httpServer;
}