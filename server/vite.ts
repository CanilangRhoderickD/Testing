import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express) {
  const port = parseInt(process.env.PORT || "5000");

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        port: port,
        host: "0.0.0.0",
        clientPort: port,
        path: "/hmr",
        protocol: "wss",
        secure: true,
      },
      allowedHosts: [
        "39ad8dd0-038e-42ac-a22b-35e772975603-00-3pkqyn5pdevvq.sisko.replit.dev",
        "*.replit.dev"
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../client/src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
    root: path.resolve(__dirname, "..", "client"),
    appType: "spa",
    optimizeDeps: { force: true },
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
      if (!fs.existsSync(clientTemplate)) {
        console.error(`⚠️ index.html not found at: ${clientTemplate}`);
        return res.status(500).send("index.html not found");
      }

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "client", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(`⚠️ Build directory not found: ${distPath}. Run 'npm run build' first.`);
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
