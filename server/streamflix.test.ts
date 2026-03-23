import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ─────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getSiteSettings: vi.fn().mockResolvedValue({
    app_name: "StreamFlix",
    maintenance_mode: "false",
  }),
  getSubscriptionPlans: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Basic",
      slug: "basic",
      priceUsd: "4.99",
      priceMxn: "99.00",
      currency: "USD",
      billingCycle: "monthly",
      features: ["HD", "1 pantalla"],
      maxQuality: "720p",
      hasAds: true,
      isActive: true,
      sortOrder: 0,
      paypalPlanId: null,
      description: "Plan básico",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Acción", slug: "accion", parentId: null, isActive: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getContent: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getContentById: vi.fn().mockResolvedValue(null),
  getContentBySlug: vi.fn().mockResolvedValue(null),
  getUserActiveSubscription: vi.fn().mockResolvedValue(null),
  getWatchHistory: vi.fn().mockResolvedValue([]),
  getWatchlist: vi.fn().mockResolvedValue([]),
  isInWatchlist: vi.fn().mockResolvedValue(false),
  addToWatchlist: vi.fn().mockResolvedValue(undefined),
  removeFromWatchlist: vi.fn().mockResolvedValue(undefined),
  upsertWatchHistory: vi.fn().mockResolvedValue(undefined),
  getAds: vi.fn().mockResolvedValue([]),
  getAdsByContent: vi.fn().mockResolvedValue([]),
  getAdsByEpisode: vi.fn().mockResolvedValue([]),
  getContentAdsByContentId: vi.fn().mockResolvedValue([]),
  getContentAdsByEpisodeId: vi.fn().mockResolvedValue([]),
  getAllUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  banUser: vi.fn().mockResolvedValue(undefined),
  getUserWatchHistoryAdmin: vi.fn().mockResolvedValue([]),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  createUserSubscription: vi.fn().mockResolvedValue(undefined),
  updateUserSubscription: vi.fn().mockResolvedValue(undefined),
  getSeasonsByContent: vi.fn().mockResolvedValue([]),
  getEpisodesBySeason: vi.fn().mockResolvedValue([]),
  getVideosByContent: vi.fn().mockResolvedValue([]),
  getVideosByEpisode: vi.fn().mockResolvedValue([]),
  getSubtitlesByContent: vi.fn().mockResolvedValue([]),
  getSubtitlesByEpisode: vi.fn().mockResolvedValue([]),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user-openid",
      name: "Test User",
      email: "test@streamflix.com",
      loginMethod: "manus",
      role: "user",
      isBanned: false,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-openid",
      name: "Admin",
      email: "admin@streamflix.com",
      loginMethod: "manus",
      role: "admin",
      isBanned: false,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("StreamFlix - Site Router", () => {
  it("getSettings returns site configuration", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const settings = await caller.site.getSettings();
    expect(settings).toBeDefined();
    expect(settings.app_name).toBe("StreamFlix");
    expect(settings.maintenance_mode).toBe("false");
  });
});

describe("StreamFlix - Plans Router", () => {
  it("list returns active subscription plans", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const plans = await caller.plans.list();
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThan(0);
    expect(plans[0]).toHaveProperty("name");
    expect(plans[0]).toHaveProperty("priceUsd");
    expect(plans[0]).toHaveProperty("slug");
  });
});

describe("StreamFlix - Categories Router", () => {
  it("list returns categories", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const categories = await caller.categories.list({ activeOnly: true });
    expect(Array.isArray(categories)).toBe(true);
    expect(categories[0]).toHaveProperty("name");
    expect(categories[0]).toHaveProperty("slug");
  });
});

describe("StreamFlix - Content Router", () => {
  it("list returns paginated content", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.content.list({ page: 1, limit: 10 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });
});

describe("StreamFlix - Watch Router", () => {
  it("getHistory requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.watch.getHistory({ limit: 10 })).rejects.toThrow();
  });

  it("getHistory returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const history = await caller.watch.getHistory({ limit: 10 });
    expect(Array.isArray(history)).toBe(true);
  });

  it("getWatchlist requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.watch.getWatchlist()).rejects.toThrow();
  });

  it("getWatchlist returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const watchlist = await caller.watch.getWatchlist();
    expect(Array.isArray(watchlist)).toBe(true);
  });

  it("isInWatchlist returns boolean", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.watch.isInWatchlist({ contentId: 1 });
    expect(typeof result).toBe("boolean");
  });
});

describe("StreamFlix - Subscription Router", () => {
  it("getMySubscription requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.subscription.getMySubscription()).rejects.toThrow();
  });

  it("getMySubscription returns null when no subscription", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const sub = await caller.subscription.getMySubscription();
    expect(sub).toBeNull();
  });
});

describe("StreamFlix - Users Router (Admin)", () => {
  it("list requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("list returns users for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.users.list();
    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.users)).toBe(true);
  });

  it("updateRole requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.users.updateRole({ userId: 2, role: "admin" })).rejects.toThrow();
  });
});

describe("StreamFlix - Ads Router", () => {
  it("list requires admin role", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.ads.list()).rejects.toThrow();
  });

  it("list returns ads for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const ads = await caller.ads.list();
    expect(Array.isArray(ads)).toBe(true);
  });

  it("byContent returns ads for content", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const ads = await caller.ads.byContent({ contentId: 1 });
    expect(Array.isArray(ads)).toBe(true);
  });

  it("byEpisode returns ads for episode", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const ads = await caller.ads.byEpisode({ episodeId: 1 });
    expect(Array.isArray(ads)).toBe(true);
  });
});

describe("StreamFlix - Auth Router", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.email).toBe("test@streamflix.com");
    expect(user?.role).toBe("user");
  });

  it("logout clears session cookie", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("StreamFlix - Users updateMyProfile", () => {
  it("updateMyProfile requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.users.updateMyProfile({ name: "Test" })).rejects.toThrow();
  });

  it("updateMyProfile succeeds for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.users.updateMyProfile({ name: "New Name" });
    expect(result.success).toBe(true);
  });
});
