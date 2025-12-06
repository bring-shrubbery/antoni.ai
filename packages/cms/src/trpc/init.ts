import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Session, User } from "../db/schema";

/**
 * Context for tRPC procedures
 */
export interface TRPCContext {
  session: Session | null;
  user: User | null;
  req: Request;
}

/**
 * Create the tRPC instance with context
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error ? error.cause.message : undefined,
      },
    };
  },
});

/**
 * Export reusable tRPC helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 * Can be used by anyone, no session required
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 * Requires a valid session
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      // Infer that session and user are non-null
      session: ctx.session,
      user: ctx.user,
    },
  });
});

/**
 * Middleware for logging
 */
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  console.log(`[tRPC] ${type} ${path} - ${duration}ms`);

  return result;
});

export { t };
