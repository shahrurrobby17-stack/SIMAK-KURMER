import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/teaching-schedules", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No user found" });
      }
      
      const schedules = await db.query.teachingSchedules.findMany({
        where: (schedules, { eq }) => eq(schedules.uid, req.user!.uid),
        orderBy: (schedules, { desc }) => [desc(schedules.createdAt)],
      });
      
      res.json(schedules);
    } catch (error: any) {
      console.error("Failed to fetch schedules:", error);
      res.status(500).json({ error: error.message || "Failed to fetch schedules" });
    }
  });

  app.post("/api/teaching-schedules", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No user found" });
      }
      
      const schedulesData = req.body;
      if (!Array.isArray(schedulesData)) {
        return res.status(400).json({ error: "Expected an array of schedules" });
      }

      // We do a simple replace all for this user's schedules (sync)
      const { eq } = await import('drizzle-orm');
      const { teachingSchedules } = await import('./src/db/schema.ts');

      await db.delete(teachingSchedules).where(eq(teachingSchedules.uid, req.user.uid));
      
      if (schedulesData.length > 0) {
        const insertData = schedulesData.map((s: any) => ({
          id: s.id,
          uid: req.user!.uid,
          day: s.day,
          time: s.time,
          className: s.className,
          sub: s.sub,
          schoolName: s.schoolName || null,
        }));
        await db.insert(teachingSchedules).values(insertData);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to save schedules:", error);
      res.status(500).json({ error: error.message || "Failed to save schedules" });
    }
  });

  // Example secure route
  app.get("/api/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No user found" });
      }
      
      const user = await getOrCreateUser(req.user.uid, req.user.email || "");
      res.json(user);
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express v4 / Express v5 appropriately
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
