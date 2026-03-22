import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initSocketIO } from "./socketio";
import { getAllAccounts } from "../db";
import { connectWhatsApp } from "../whatsapp";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Initialize Socket.io
  initSocketIO(server);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Auto-reconectar contas WhatsApp com sessão salva em disco (após servidor iniciar)
  setTimeout(async () => {
    try {
      const waAccounts = (await getAllAccounts()).filter(a => a.channel === "whatsapp");
      for (const acc of waAccounts) {
        const sessionPath = path.join(process.cwd(), ".wa-sessions", `account-${acc.id}`);
        if (fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0) {
          console.log(`[WhatsApp] Auto-reconectando conta #${acc.id} (${acc.name})...`);
          connectWhatsApp(acc.id).catch(err =>
            console.error(`[WhatsApp] Erro ao auto-reconectar conta #${acc.id}:`, err)
          );
        }
      }
    } catch (err) {
      console.error("[WhatsApp] Erro na auto-reconexão inicial:", err);
    }
  }, 3000); // aguardar 3s para o banco estar pronto
}

startServer().catch(console.error);
