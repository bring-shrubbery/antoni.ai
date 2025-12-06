import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, type TRPCContext } from "./index";
import { getSession } from "../auth";
import type { Session, User } from "../db/schema";

/**
 * Creates the context for each tRPC request
 * Extracts session and user from the request using better-auth
 */
export const createContext = async (req: Request): Promise<TRPCContext> => {
  let session: Session | null = null;
  let user: User | null = null;

  try {
    const authSession = await getSession(req);

    if (authSession?.session && authSession?.user) {
      session = {
        id: authSession.session.id,
        token: authSession.session.token,
        expiresAt: authSession.session.expiresAt,
        createdAt: authSession.session.createdAt,
        updatedAt: authSession.session.updatedAt,
        ipAddress: authSession.session.ipAddress ?? null,
        userAgent: authSession.session.userAgent ?? null,
        userId: authSession.session.userId,
      };

      user = {
        id: authSession.user.id,
        name: authSession.user.name,
        email: authSession.user.email,
        emailVerified: authSession.user.emailVerified,
        image: authSession.user.image ?? null,
        createdAt: authSession.user.createdAt,
        updatedAt: authSession.user.updatedAt,
      };
    }
  } catch (error) {
    // Session not found or invalid, continue as unauthenticated
    console.debug("No valid session found:", error);
  }

  return {
    session,
    user,
    req,
  };
};

/**
 * Handle tRPC requests using the fetch adapter
 */
export const handleTRPCRequest = async (req: Request): Promise<Response> => {
  return fetchRequestHandler({
    endpoint: "/admin/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ path, error }) => {
      console.error(`[tRPC Error] ${path}:`, error);
    },
  });
};
