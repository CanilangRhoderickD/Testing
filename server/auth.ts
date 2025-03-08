import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  console.log('Hashing password');
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  console.log('Password hashed:', `${buf.toString("hex")}.${salt}`);
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  console.log('Comparing passwords');
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  console.log('Passwords match:', timingSafeEqual(hashedBuf, suppliedBuf));
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  console.log('Setting up authentication');
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'apula-fire-safety-secret-key',
    resave: false, 
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: 'lax' },
    store: storage.sessionStore,
  };
  console.log('Session settings:', sessionSettings);

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Adjust the origin as needed
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    console.log('Received registration request:', req.body);
    console.log('Validating input fields');
    const { username, password, age } = req.body;
    if (!username || !password || age === undefined) {
      console.log('Missing required fields');
      return res.status(400).send('Missing required fields');
    }

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.status(400).send('Username already exists');
    }

    // Get all users to check if this is the first user
    const allUsers = await storage.getAllUsers();
    const isFirstUser = allUsers.length === 0;

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
      isAdmin: isFirstUser // Make the first user an admin
    });

    req.login(user, (err) => {
      if (err) {
        console.log('Error logging in after registration:', err);
        return next(err);
      }
      console.log('User registered and logged in:', user);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local", { failureFlash: true }), (req, res) => {
    console.log('Login attempt for user:', req.body.username);
    if (!req.user) {
      console.log('Authentication failed for user:', req.body.username);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('User logged in:', req.user);
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('Checking authentication for /api/user');
    if (!req.isAuthenticated()) {
      console.log('User not authenticated');
      return res.sendStatus(401);
    }
    console.log('User authenticated:', req.user);
    // Return user with their achievements count
    res.json({
      ...req.user,
      // Include achievement count if needed
      achievementsCount: storage.userAchievements.get(req.user.id)?.length || 0
    });
  });
}