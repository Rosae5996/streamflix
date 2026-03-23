import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { COOKIE_NAME } from "../../shared/const";
import * as db from "../../server/db";
import { jwtVerify } from "jose";

// Get session secret
function getSessionSecret() {
  const secret = process.env.JWT_SECRET || "";
  return new TextEncoder().encode(secret);
}

// Verify session token
async function verifySession(cookieValue: string | undefined | null) {
  if (!cookieValue) return null;

  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(cookieValue, secretKey, {
      algorithms: ["HS256"],
    });
    const { openId, appId, name } = payload as Record<string, unknown>;

    if (typeof openId !== "string" || !openId) {
      return null;
    }

    return { openId, appId: appId as string, name: name as string };
  } catch (error) {
    console.warn("[Auth] Session verification failed:", error);
    return null;
  }
}

// Parse cookies from header
function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  
  const cookies = new Map<string, string>();
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies.set(name, decodeURIComponent(rest.join("=")));
    }
  });
  return cookies;
}

// Create context for each request
async function createContext({ req, cookies }: { req: Request; cookies: Map<string, string> }) {
  let user = null;

  try {
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await verifySession(sessionCookie);

    if (session) {
      user = await db.getUserByOpenId(session.openId);
    }
  } catch (error) {
    console.warn("[tRPC] Auth error:", error);
    user = null;
  }

  return {
    user,
    req,
    res: null as any, // Vercel serverless doesn't have express res
    cookies: Object.fromEntries(cookies),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(200).end();
  }

  // Parse cookies
  const cookies = parseCookies(req.headers.cookie);

  // Convert Vercel request to Web Request
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;
  
  // Build headers, filtering out undefined values
  const headerEntries: [string, string][] = [];
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headerEntries.push([key, value]);
    } else if (Array.isArray(value)) {
      headerEntries.push([key, value.join(", ")]);
    }
  }

  const webRequest = new Request(url, {
    method: req.method,
    headers: new Headers(headerEntries),
    body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
  });

  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: webRequest,
      router: appRouter,
      createContext: () => createContext({ req: webRequest, cookies }),
      onError({ error, path }) {
        console.error(`[tRPC] Error in ${path}:`, error.message);
      },
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set CORS headers
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Send response
    const body = await response.text();
    return res.status(response.status).send(body);
  } catch (error) {
    console.error("[tRPC] Handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
