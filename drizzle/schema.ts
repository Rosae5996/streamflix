import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isBanned: boolean("isBanned").default(false).notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// ─── Subscription Plans ───────────────────────────────────────────────────────
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  description: text("description"),
  priceUsd: decimal("priceUsd", { precision: 10, scale: 2 }).notNull(),
  priceMxn: decimal("priceMxn", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  features: json("features").$type<string[]>().default([]),
  maxQuality: mysqlEnum("maxQuality", ["480p", "720p", "1080p", "4K"]).default("1080p").notNull(),
  hasAds: boolean("hasAds").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  paypalPlanId: varchar("paypalPlanId", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// ─── User Subscriptions ───────────────────────────────────────────────────────
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "pending"]).default("pending").notNull(),
  paypalSubscriptionId: varchar("paypalSubscriptionId", { length: 256 }),
  paypalOrderId: varchar("paypalOrderId", { length: 256 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  parentId: int("parentId"),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ─── Content (Movies & Series) ────────────────────────────────────────────────
export const content = mysqlTable("content", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  type: mysqlEnum("type", ["movie", "series"]).notNull(),
  description: text("description"),
  shortDescription: text("shortDescription"),
  posterUrl: text("posterUrl"),
  backdropUrl: text("backdropUrl"),
  trailerUrl: text("trailerUrl"),
  releaseYear: int("releaseYear"),
  duration: int("duration"), // minutes (for movies)
  rating: varchar("rating", { length: 16 }), // PG, PG-13, R, etc.
  imdbRating: decimal("imdbRating", { precision: 3, scale: 1 }),
  categoryId: int("categoryId"),
  tags: json("tags").$type<string[]>().default([]),
  cast: json("cast").$type<string[]>().default([]),
  director: varchar("director", { length: 256 }),
  language: varchar("language", { length: 64 }).default("es"),
  country: varchar("country", { length: 64 }),
  status: mysqlEnum("status", ["published", "draft", "archived"]).default("draft").notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isFree: boolean("isFree").default(false).notNull(),
  minPlanId: int("minPlanId"), // minimum plan required to watch
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Content = typeof content.$inferSelect;

// ─── Seasons ──────────────────────────────────────────────────────────────────
export const seasons = mysqlTable("seasons", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  number: int("number").notNull(),
  title: varchar("title", { length: 256 }),
  description: text("description"),
  posterUrl: text("posterUrl"),
  releaseYear: int("releaseYear"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Season = typeof seasons.$inferSelect;

// ─── Episodes ─────────────────────────────────────────────────────────────────
export const episodes = mysqlTable("episodes", {
  id: int("id").autoincrement().primaryKey(),
  seasonId: int("seasonId").notNull(),
  contentId: int("contentId").notNull(),
  number: int("number").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"), // seconds
  isFree: boolean("isFree").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Episode = typeof episodes.$inferSelect;

// ─── Videos (quality variants) ────────────────────────────────────────────────
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId"),
  episodeId: int("episodeId"),
  quality: mysqlEnum("quality", ["360p", "480p", "720p", "1080p", "4K"]).notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey"),
  fileSize: int("fileSize"), // bytes
  mimeType: varchar("mimeType", { length: 64 }).default("video/mp4"),
  duration: int("duration"), // seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;

// ─── Subtitles ────────────────────────────────────────────────────────────────
export const subtitles = mysqlTable("subtitles", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId"),
  episodeId: int("episodeId"),
  language: varchar("language", { length: 64 }).notNull(),
  languageCode: varchar("languageCode", { length: 8 }).notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey"),
  format: varchar("format", { length: 16 }).default("vtt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subtitle = typeof subtitles.$inferSelect;

// ─── Ads ──────────────────────────────────────────────────────────────────────
export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl"),
  imageUrl: text("imageUrl"),
  clickUrl: text("clickUrl"),
  duration: int("duration").default(15).notNull(), // seconds
  isSkippable: boolean("isSkippable").default(true).notNull(),
  skipAfter: int("skipAfter").default(5), // seconds before skip button appears
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;

// ─── Content Ads (ads assigned to specific content at specific timestamps) ────
export const contentAds = mysqlTable("content_ads", {
  id: int("id").autoincrement().primaryKey(),
  adId: int("adId").notNull(),
  contentId: int("contentId"),
  episodeId: int("episodeId"),
  timestamp: int("timestamp").notNull(), // seconds into the video
  appliesTo: json("appliesTo").$type<string[]>().default(["basic"]), // plan slugs that see this ad
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentAd = typeof contentAds.$inferSelect;

// ─── Watch History ────────────────────────────────────────────────────────────
export const watchHistory = mysqlTable("watch_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId").notNull(),
  episodeId: int("episodeId"),
  progressSeconds: int("progressSeconds").default(0).notNull(),
  totalSeconds: int("totalSeconds").default(0),
  completed: boolean("completed").default(false).notNull(),
  watchedAt: timestamp("watchedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WatchHistory = typeof watchHistory.$inferSelect;

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const watchlist = mysqlTable("watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type Watchlist = typeof watchlist.$inferSelect;
