import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut, randomSuffix } from "./storage";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso de administrador requerido" });
  }
  return next({ ctx });
});

// ─── Site Settings Router ─────────────────────────────────────────────────────
const siteRouter = router({
  getSettings: publicProcedure.query(async () => {
    return db.getSiteSettings();
  }),
  updateSettings: adminProcedure
    .input(z.record(z.string(), z.string()))
    .mutation(async ({ input }) => {
      await db.upsertSiteSettings(input);
      return { success: true };
    }),
});

// ─── Subscription Plans Router ────────────────────────────────────────────────
const plansRouter = router({
  list: publicProcedure
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      return db.getSubscriptionPlans(input?.activeOnly ?? false);
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getSubscriptionPlanById(input.id);
    }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        priceUsd: z.string(),
        priceMxn: z.string().optional(),
        currency: z.string().default("USD"),
        billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
        features: z.array(z.string()).default([]),
        maxQuality: z.enum(["480p", "720p", "1080p", "4K"]).default("1080p"),
        hasAds: z.boolean().default(false),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
        paypalPlanId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createSubscriptionPlan({
        ...input,
        features: input.features,
      } as any);
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        priceUsd: z.string().optional(),
        priceMxn: z.string().optional(),
        currency: z.string().optional(),
        billingCycle: z.enum(["monthly", "yearly"]).optional(),
        features: z.array(z.string()).optional(),
        maxQuality: z.enum(["480p", "720p", "1080p", "4K"]).optional(),
        hasAds: z.boolean().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
        paypalPlanId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSubscriptionPlan(id, data as any);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteSubscriptionPlan(input.id);
      return { success: true };
    }),
});

// ─── User Subscriptions Router ────────────────────────────────────────────────
const subscriptionRouter = router({
  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserActiveSubscription(ctx.user.id);
  }),
  createOrder: protectedProcedure
    .input(z.object({ planId: z.number(), paypalOrderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.createUserSubscription({
        userId: ctx.user.id,
        planId: input.planId,
        status: "pending",
        paypalOrderId: input.paypalOrderId,
      });
      return { success: true };
    }),
  activateSubscription: protectedProcedure
    .input(z.object({ planId: z.number(), paypalOrderId: z.string(), paypalSubscriptionId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      await db.createUserSubscription({
        userId: ctx.user.id,
        planId: input.planId,
        status: "active",
        paypalOrderId: input.paypalOrderId,
        paypalSubscriptionId: input.paypalSubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: end,
      });
      return { success: true };
    }),
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateUserSubscription(input.subscriptionId, { status: "cancelled" });
      return { success: true };
    }),
});

// ─── Categories Router ────────────────────────────────────────────────────────
const categoriesRouter = router({
  list: publicProcedure
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      return db.getCategories(input?.activeOnly ?? false);
    }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        parentId: z.number().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await db.createCategory(input);
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        parentId: z.number().optional().nullable(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCategory(id, data as any);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCategory(input.id);
      return { success: true };
    }),
});

// ─── Content Router ───────────────────────────────────────────────────────────
const contentRouter = router({
  list: publicProcedure
    .input(
      z.object({
        type: z.enum(["movie", "series"]).optional(),
        categoryId: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      return db.getContent(input ?? {});
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const item = await db.getContentById(input.id);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return item;
    }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const item = await db.getContentBySlug(input.slug);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return item;
    }),
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        type: z.enum(["movie", "series"]),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        posterUrl: z.string().optional(),
        backdropUrl: z.string().optional(),
        trailerUrl: z.string().optional(),
        releaseYear: z.number().optional(),
        duration: z.number().optional(),
        rating: z.string().optional(),
        imdbRating: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).default([]),
        cast: z.array(z.string()).default([]),
        director: z.string().optional(),
        language: z.string().default("es"),
        country: z.string().optional(),
        status: z.enum(["published", "draft", "archived"]).default("draft"),
        isFeatured: z.boolean().default(false),
        isFree: z.boolean().default(false),
        minPlanId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createContent(input as any);
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        posterUrl: z.string().optional(),
        backdropUrl: z.string().optional(),
        trailerUrl: z.string().optional(),
        releaseYear: z.number().optional(),
        duration: z.number().optional(),
        rating: z.string().optional(),
        imdbRating: z.string().optional(),
        categoryId: z.number().optional().nullable(),
        tags: z.array(z.string()).optional(),
        cast: z.array(z.string()).optional(),
        director: z.string().optional(),
        language: z.string().optional(),
        country: z.string().optional(),
        status: z.enum(["published", "draft", "archived"]).optional(),
        isFeatured: z.boolean().optional(),
        isFree: z.boolean().optional(),
        minPlanId: z.number().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateContent(id, data as any);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteContent(input.id);
      return { success: true };
    }),
  incrementView: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementViewCount(input.id);
      return { success: true };
    }),
});

// ─── Seasons Router ───────────────────────────────────────────────────────────
const seasonsRouter = router({
  byContent: publicProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      return db.getSeasonsByContentId(input.contentId);
    }),
  create: adminProcedure
    .input(
      z.object({
        contentId: z.number(),
        number: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        posterUrl: z.string().optional(),
        releaseYear: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createSeason(input);
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        number: z.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        posterUrl: z.string().optional(),
        releaseYear: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSeason(id, data);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteSeason(input.id);
      return { success: true };
    }),
});

// ─── Episodes Router ──────────────────────────────────────────────────────────
const episodesRouter = router({
  bySeason: publicProcedure
    .input(z.object({ seasonId: z.number() }))
    .query(async ({ input }) => {
      return db.getEpisodesBySeasonId(input.seasonId);
    }),
  byContent: publicProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      return db.getEpisodesByContentId(input.contentId);
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getEpisodeById(input.id);
    }),
  create: adminProcedure
    .input(
      z.object({
        seasonId: z.number(),
        contentId: z.number(),
        number: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        isFree: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      await db.createEpisode(input);
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        number: z.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        isFree: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateEpisode(id, data);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteEpisode(input.id);
      return { success: true };
    }),
});

// ─── Videos Router ────────────────────────────────────────────────────────────
const videosRouter = router({
  byContent: publicProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      return db.getVideosByContentId(input.contentId);
    }),
  byEpisode: publicProcedure
    .input(z.object({ episodeId: z.number() }))
    .query(async ({ input }) => {
      return db.getVideosByEpisodeId(input.episodeId);
    }),
  create: adminProcedure
    .input(
      z.object({
        contentId: z.number().optional(),
        episodeId: z.number().optional(),
        quality: z.enum(["360p", "480p", "720p", "1080p", "4K"]),
        url: z.string().min(1),
        fileKey: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createVideo(input);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteVideo(input.id);
      return { success: true };
    }),
});

// ─── Subtitles Router ─────────────────────────────────────────────────────────
const subtitlesRouter = router({
  byContent: publicProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      return db.getSubtitlesByContentId(input.contentId);
    }),
  byEpisode: publicProcedure
    .input(z.object({ episodeId: z.number() }))
    .query(async ({ input }) => {
      return db.getSubtitlesByEpisodeId(input.episodeId);
    }),
  create: adminProcedure
    .input(
      z.object({
        contentId: z.number().optional(),
        episodeId: z.number().optional(),
        language: z.string().min(1),
        languageCode: z.string().min(1),
        url: z.string().min(1),
        fileKey: z.string().optional(),
        format: z.string().default("vtt"),
      })
    )
    .mutation(async ({ input }) => {
      await db.createSubtitle(input);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteSubtitle(input.id);
      return { success: true };
    }),
});

// ─── Ads Router ───────────────────────────────────────────────────────────────
const adsRouter = router({
  list: adminProcedure
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAds(input?.activeOnly ?? false);
    }),
  byContent: publicProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      return db.getContentAdsByContentId(input.contentId);
    }),
  byEpisode: publicProcedure
    .input(z.object({ episodeId: z.number() }))
    .query(async ({ input }) => {
      return db.getContentAdsByEpisodeId(input.episodeId);
    }),
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        clickUrl: z.string().optional(),
        duration: z.number().default(15),
        isSkippable: z.boolean().default(true),
        skipAfter: z.number().default(5),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      await db.createAd(input);
      return { success: true };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        clickUrl: z.string().optional(),
        duration: z.number().optional(),
        isSkippable: z.boolean().optional(),
        skipAfter: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAd(id, data);
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteAd(input.id);
      return { success: true };
    }),
  assignToContent: adminProcedure
    .input(
      z.object({
        adId: z.number(),
        contentId: z.number().optional(),
        episodeId: z.number().optional(),
        timestamp: z.number(),
        appliesTo: z.array(z.string()).default(["basic"]),
      })
    )
    .mutation(async ({ input }) => {
      await db.createContentAd(input as any);
      return { success: true };
    }),
  removeFromContent: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteContentAd(input.id);
      return { success: true };
    }),
});

// ─── Users Admin Router ───────────────────────────────────────────────────────
const usersRouter = router({
  list: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return db.getAllUsers(input?.page ?? 1, input?.limit ?? 20, input?.search ?? "");
    }),
  updateRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await db.updateUserRole(input.userId, input.role);
      return { success: true };
    }),
  ban: adminProcedure
    .input(z.object({ userId: z.number(), isBanned: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.banUser(input.userId, input.isBanned);
      return { success: true };
    }),
  getWatchHistory: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getUserWatchHistoryAdmin(input.userId);
    }),
  updateMyProfile: protectedProcedure
    .input(z.object({ name: z.string().optional(), email: z.string().email().optional() }))
    .mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── Watch History & Watchlist Router ────────────────────────────────────────
const watchRouter = router({
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      return db.getWatchHistory(ctx.user.id, input?.limit ?? 20);
    }),
  updateProgress: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        episodeId: z.number().optional(),
        progressSeconds: z.number(),
        totalSeconds: z.number().optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.upsertWatchHistory({ userId: ctx.user.id, ...input });
      return { success: true };
    }),
  getWatchlist: protectedProcedure.query(async ({ ctx }) => {
    return db.getWatchlist(ctx.user.id);
  }),
  isInWatchlist: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.isInWatchlist(ctx.user.id, input.contentId);
    }),
  addToWatchlist: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.addToWatchlist(ctx.user.id, input.contentId);
      return { success: true };
    }),
  removeFromWatchlist: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.removeFromWatchlist(ctx.user.id, input.contentId);
      return { success: true };
    }),
});

// ─── Upload Router ────────────────────────────────────────────────────────────
const uploadRouter = router({
  getUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        folder: z.string().default("uploads"),
      })
    )
    .mutation(async ({ input }) => {
      const ext = input.filename.split(".").pop() ?? "bin";
      const key = `${input.folder}/${randomSuffix()}.${ext}`;
      // Return key for client to upload
      return { key, uploadPath: `/api/upload/${key}` };
    }),
  uploadFile: adminProcedure
    .input(
      z.object({
        key: z.string(),
        base64Data: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const { url } = await storagePut(input.key, buffer, input.contentType);
      return { url, key: input.key };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  site: siteRouter,
  plans: plansRouter,
  subscription: subscriptionRouter,
  categories: categoriesRouter,
  content: contentRouter,
  seasons: seasonsRouter,
  episodes: episodesRouter,
  videos: videosRouter,
  subtitles: subtitlesRouter,
  ads: adsRouter,
  users: usersRouter,
  watch: watchRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
