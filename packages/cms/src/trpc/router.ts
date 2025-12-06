import { createTRPCRouter, publicProcedure, protectedProcedure } from "./init";
import { contentTypeRouter } from "./routers/content-type";
import { contentEntryRouter } from "./routers/content-entry";
import { mediaRouter } from "./routers/media";
import { setupRouter } from "./routers/setup";
import { collectionsRouter } from "./routers/collections";
import { entriesRouter } from "./routers/entries";

/**
 * Main CMS API Router
 */
export const appRouter = createTRPCRouter({
  /**
   * Setup and admin management
   */
  setup: setupRouter,

  /**
   * Collections (new API for schema + content management)
   */
  collections: collectionsRouter,

  /**
   * Entries (new API for content entries)
   */
  entries: entriesRouter,

  /**
   * Content types (schemas) - legacy, use collections instead
   */
  contentType: contentTypeRouter,

  /**
   * Content entries (actual data) - legacy, use entries instead
   */
  contentEntry: contentEntryRouter,

  /**
   * Media/file management
   */
  media: mediaRouter,

  /**
   * Example public endpoint - health check
   */
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
    };
  }),

  /**
   * Example protected endpoint - get current user info
   */
  me: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      session: {
        id: ctx.session.id,
        expiresAt: ctx.session.expiresAt,
      },
    };
  }),
});

export type AppRouter = typeof appRouter;

export { createTRPCRouter, publicProcedure, protectedProcedure } from "./init";
export type { TRPCContext } from "./init";
