import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    environment: process.env.NODE_ENV || "development",
    checks: {
      database: false,
      environment: false,
    },
  };

  // Check environment variables
  const requiredEnvVars = ["DATABASE_URL", "VITE_SUPABASE_URL", "JWT_SECRET"];
  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
  healthCheck.checks.environment = missingEnvVars.length === 0;

  // Check database connection
  try {
    if (process.env.DATABASE_URL) {
      const db = await import("../server/db");
      await db.getSiteSettings();
      healthCheck.checks.database = true;
    }
  } catch (error) {
    console.error("[Health] Database check failed:", error);
    healthCheck.checks.database = false;
  }

  // Determine overall status
  const allChecksPass = Object.values(healthCheck.checks).every(Boolean);
  healthCheck.status = allChecksPass ? "healthy" : "degraded";

  const statusCode = allChecksPass ? 200 : 503;
  
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  
  return res.status(statusCode).json(healthCheck);
}
