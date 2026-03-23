import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  ads,
  categories,
  content,
  contentAds,
  episodes,
  seasons,
  siteSettings,
  subscriptionPlans,
  subtitles,
  userSubscriptions,
  users,
  videos,
  watchHistory,
  watchlist,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(page = 1, limit = 20, search = "") {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const offset = (page - 1) * limit;
  let query = db.select().from(users);
  if (search) {
    query = query.where(
      or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
    ) as typeof query;
  }
  const result = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  return { users: result, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function banUser(userId: number, isBanned: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isBanned }).where(eq(users.id, userId));
}

export async function updateUserProfile(userId: number, data: { name?: string; email?: string }) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (Object.keys(updateData).length > 0) {
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return {};
  const result = await db.select().from(siteSettings);
  return Object.fromEntries(result.map((s) => [s.key, s.value]));
}

export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result[0]?.value ?? null;
}

export async function upsertSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(siteSettings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

export async function upsertSiteSettings(settings: Record<string, string>) {
  const db = await getDb();
  if (!db) return;
  for (const [key, value] of Object.entries(settings)) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onDuplicateKeyUpdate({ set: { value } });
  }
}

// ─── Subscription Plans ───────────────────────────────────────────────────────
export async function getSubscriptionPlans(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(subscriptionPlans);
  if (activeOnly) query = query.where(eq(subscriptionPlans.isActive, true)) as typeof query;
  return query.orderBy(subscriptionPlans.sortOrder);
}

export async function getSubscriptionPlanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionPlanBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function createSubscriptionPlan(data: typeof subscriptionPlans.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(subscriptionPlans).values(data);
  return result;
}

export async function updateSubscriptionPlan(id: number, data: Partial<typeof subscriptionPlans.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id));
}

export async function deleteSubscriptionPlan(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
}

// ─── User Subscriptions ───────────────────────────────────────────────────────
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({ sub: userSubscriptions, plan: subscriptionPlans })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active")))
    .limit(1);
  return result[0] ?? null;
}

export async function createUserSubscription(data: typeof userSubscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(userSubscriptions).values(data);
  return result;
}

export async function updateUserSubscription(id: number, data: Partial<typeof userSubscriptions.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(userSubscriptions).set(data).where(eq(userSubscriptions.id, id));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(categories);
  if (activeOnly) query = query.where(eq(categories.isActive, true)) as typeof query;
  return query.orderBy(categories.sortOrder);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Content ──────────────────────────────────────────────────────────────────
export async function getContent(opts: {
  type?: "movie" | "series";
  categoryId?: number;
  status?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { type, categoryId, status, search, featured, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (type) conditions.push(eq(content.type, type));
  if (categoryId) conditions.push(eq(content.categoryId, categoryId));
  if (status) conditions.push(eq(content.status, status as "published" | "draft" | "archived"));
  if (featured !== undefined) conditions.push(eq(content.isFeatured, featured));
  if (search) {
    conditions.push(
      or(like(content.title, `%${search}%`), like(content.description, `%${search}%`))
    );
  }

  let query = db.select().from(content);
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const items = await query.orderBy(desc(content.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(content);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getContentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(content).where(eq(content.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getContentBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(content).where(eq(content.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function createContent(data: typeof content.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(content).values(data);
}

export async function updateContent(id: number, data: Partial<typeof content.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(content).set({ ...data, updatedAt: new Date() }).where(eq(content.id, id));
}

export async function deleteContent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(content).where(eq(content.id, id));
}

export async function incrementViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(content).set({ viewCount: sql`viewCount + 1` }).where(eq(content.id, id));
}

// ─── Seasons ──────────────────────────────────────────────────────────────────
export async function getSeasonsByContentId(contentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seasons).where(eq(seasons.contentId, contentId)).orderBy(seasons.number);
}

export async function createSeason(data: typeof seasons.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(seasons).values(data);
}

export async function updateSeason(id: number, data: Partial<typeof seasons.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(seasons).set(data).where(eq(seasons.id, id));
}

export async function deleteSeason(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(seasons).where(eq(seasons.id, id));
}

// ─── Episodes ─────────────────────────────────────────────────────────────────
export async function getEpisodesBySeasonId(seasonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(episodes).where(eq(episodes.seasonId, seasonId)).orderBy(episodes.number);
}

export async function getEpisodesByContentId(contentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(episodes).where(eq(episodes.contentId, contentId)).orderBy(episodes.number);
}

export async function getEpisodeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(episodes).where(eq(episodes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createEpisode(data: typeof episodes.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(episodes).values(data);
}

export async function updateEpisode(id: number, data: Partial<typeof episodes.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(episodes).set(data).where(eq(episodes.id, id));
}

export async function deleteEpisode(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(episodes).where(eq(episodes.id, id));
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export async function getVideosByContentId(contentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).where(eq(videos.contentId, contentId));
}

export async function getVideosByEpisodeId(episodeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).where(eq(videos.episodeId, episodeId));
}

export async function createVideo(data: typeof videos.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(videos).values(data);
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(videos).where(eq(videos.id, id));
}

// ─── Subtitles ────────────────────────────────────────────────────────────────
export async function getSubtitlesByContentId(contentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subtitles).where(eq(subtitles.contentId, contentId));
}

export async function getSubtitlesByEpisodeId(episodeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subtitles).where(eq(subtitles.episodeId, episodeId));
}

export async function createSubtitle(data: typeof subtitles.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(subtitles).values(data);
}

export async function deleteSubtitle(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(subtitles).where(eq(subtitles.id, id));
}

// ─── Ads ──────────────────────────────────────────────────────────────────────
export async function getAds(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(ads);
  if (activeOnly) query = query.where(eq(ads.isActive, true)) as typeof query;
  return query.orderBy(desc(ads.createdAt));
}

export async function getAdById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ads).where(eq(ads.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createAd(data: typeof ads.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(ads).values(data);
}

export async function updateAd(id: number, data: Partial<typeof ads.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(ads).set(data).where(eq(ads.id, id));
}

export async function deleteAd(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(ads).where(eq(ads.id, id));
}

// ─── Content Ads ──────────────────────────────────────────────────────────────
export async function getContentAdsByContentId(contentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ contentAd: contentAds, ad: ads })
    .from(contentAds)
    .innerJoin(ads, eq(contentAds.adId, ads.id))
    .where(eq(contentAds.contentId, contentId))
    .orderBy(contentAds.timestamp);
}

export async function getContentAdsByEpisodeId(episodeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ contentAd: contentAds, ad: ads })
    .from(contentAds)
    .innerJoin(ads, eq(contentAds.adId, ads.id))
    .where(eq(contentAds.episodeId, episodeId))
    .orderBy(contentAds.timestamp);
}

export async function createContentAd(data: typeof contentAds.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(contentAds).values(data);
}

export async function deleteContentAd(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contentAds).where(eq(contentAds.id, id));
}

// ─── Watch History ────────────────────────────────────────────────────────────
export async function getWatchHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ history: watchHistory, content })
    .from(watchHistory)
    .innerJoin(content, eq(watchHistory.contentId, content.id))
    .where(eq(watchHistory.userId, userId))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(limit);
}

export async function getUserWatchHistoryAdmin(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ history: watchHistory, content })
    .from(watchHistory)
    .innerJoin(content, eq(watchHistory.contentId, content.id))
    .where(eq(watchHistory.userId, userId))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(50);
}

export async function upsertWatchHistory(data: {
  userId: number;
  contentId: number;
  episodeId?: number;
  progressSeconds: number;
  totalSeconds?: number;
  completed?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(watchHistory)
    .where(
      and(
        eq(watchHistory.userId, data.userId),
        eq(watchHistory.contentId, data.contentId),
        data.episodeId ? eq(watchHistory.episodeId, data.episodeId) : sql`episodeId IS NULL`
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(watchHistory)
      .set({
        progressSeconds: data.progressSeconds,
        totalSeconds: data.totalSeconds,
        completed: data.completed ?? false,
        watchedAt: new Date(),
      })
      .where(eq(watchHistory.id, existing[0].id));
  } else {
    await db.insert(watchHistory).values({
      userId: data.userId,
      contentId: data.contentId,
      episodeId: data.episodeId,
      progressSeconds: data.progressSeconds,
      totalSeconds: data.totalSeconds,
      completed: data.completed ?? false,
    });
  }
}

// ─── Watchlist ────────────────────────────────────────────────────────────────
export async function getWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ watchlistItem: watchlist, content })
    .from(watchlist)
    .innerJoin(content, eq(watchlist.contentId, content.id))
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.addedAt));
}

export async function isInWatchlist(userId: number, contentId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.contentId, contentId)))
    .limit(1);
  return result.length > 0;
}

export async function addToWatchlist(userId: number, contentId: number) {
  const db = await getDb();
  if (!db) return;
  const exists = await isInWatchlist(userId, contentId);
  if (!exists) {
    await db.insert(watchlist).values({ userId, contentId });
  }
}

export async function removeFromWatchlist(userId: number, contentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(watchlist).where(and(eq(watchlist.userId, userId), eq(watchlist.contentId, contentId)));
}
