import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupInitialData } from "./setup";
import session from "express-session";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'apula_fire_safety_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false to work in development
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true
  },
  store: storage.sessionStore
};

app.use(session(sessionConfig));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize sample data
  try {
    await setupInitialData();
    log("Sample data initialized successfully");
  } catch (error) {
    log("Error initializing sample data:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000");
  
  // Try to start the server, handle the case if port is already in use
  const maxPortTries = 10; // Limit attempts to find an open port
  let attemptCount = 0;
  let currentPort = port;
  
  function tryNextPort() {
    attemptCount++;
    if (attemptCount > maxPortTries) {
      log(`Failed to find an available port after ${maxPortTries} attempts.`);
      process.exit(1);
      return;
    }
    
    currentPort++;
    log(`Trying alternative port ${currentPort}...`);
    startListening();
  }
  
  function startListening() {
    server.once('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        log(`Port ${currentPort} is already in use`);
        tryNextPort();
      } else {
        log(`Server error: ${e.message}`);
        process.exit(1);
      }
    });
    
    server.listen({
      port: currentPort,
      host: "0.0.0.0",
      reusePort: false, // Changed to false to prevent multiple bindings
    }, () => {
      log(`Server running at http://0.0.0.0:${currentPort}`);
    });
  }
  
  startListening();
})();
